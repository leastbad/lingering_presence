# Lingering Presence

This is a Rails 7 project that demonstrates the use and application of the [Linger](https://github.com/leastbad/linger) gem and how to integrate it with Devise. It also serves as a repository of collected wisdom for patterns and code samples that are useful for building Reactive Rails applications.

Linger takes advantage of the new `throw :forbidden` feature in StimulusReflex 3.5 to provide _unopinionated_ authentication security to Reflexes. If you have two tabs open and sign out in one, you should not be able to run Reflexes in the other tab. If you have sessions active on multiple devices, signing out on one should not impact the sessions on the others. These deceptively hard requirements are addressed by creating a composite key in Redis for every uniquely identified session.

Developers can respond to authentication failures by handling Reflexes that arrive in a new `forbidden` state. Forbidden Reflexes are functionally identical to halted Reflexes (eg. `throw :abort`) except that they (conceptually and semantically) represent Reflexes which were not allowed to execute.

## Usage and concepts

- `bin/setup`
- `bin/dev`

The most direct way to experiment with Linger is to open multiple tabs, ideally across multiple devices. You can fake multiple devices with incognito mode or separate browsers. Open your console inspector to see what's happening; if a Reflex was forbidden to execute, it will report this outcome in purple lettering.

A significant portion of the logic for this application is in four classes:

- `app/channels/application_cable/connection.rb`
- `app/controllers/application_controller.rb`
- `app/controllers/users/sessions_controller.rb`
- `app/controllers/users/registrations_controller.rb`

The big idea of Linger is that you have to explicitly allow/deny composite keys. It might be an abused cliche, but picture the bouncer at the club with a clipboard that has two columns. The Linger API couldn't be more simple: you just have to cover all of the user authentication and permission context changes appropriately.

`ApplicationController` handling is necessary because authenticated users can open multiple tabs.

### Anonymous users

It might be tempting to set up your `app/channels/application_cable/connection.rb` to only accept connection attempts from users who have authenticated with Devise. I recommend that you should almost certainly set up your application to operate on session + user identifiers, possibly 100% of the time.

First, it's only a matter of time before you realize that you want to use a Reflex on a UI that can be accessed by unauthenticated users.

However, the biggest reason is that even if you don't support guests executing Reflexes, _you still have to handle the transitions between unauthenticated and authenticated user states_. This suggests that the more complex approach might be the simplest to implement because I've given you `connection.rb` code that should cut + paste into 99% of Devise-powered Rails apps.

If you don't support unauthenticated users, make sure to comment or remove the Linger calls to `allow` session-only keys. You can focus on `allow`ing contexts when users authenticate, and `deny`ing them when they sign out.

### Devise controller actions

Devise does an impressive job of allowing developers to customize how everything works, but it is still software that was designed in the pre-"Over The Wire" era. Everything out of the box assumes that you're going to be clicking links that open new pages.

You'll see how we have to adapt our own `sessions#create`, `sessions#destroy` and `registrations#create` actions that are based on but different from the [originals](https://github.com/heartcombo/devise/tree/main/app/controllers/devise). Please be aware that if you use other Devise modules, you should extrapolate the logic you see in `sessions` and `registration` to other classes.

### Thundering herd management

In Rails 7, Action Cable introduced a randomized, growing delay before a client will attempt to automatically reconnect. This is designed to keep your users from DDoSing you after recovering from an outage. This is a noble and correct goal.

However, it's also quite painful to force users to sit tight for 10 seconds when you have initiated a `disconnect` for one user. Luckily, there is a loophole in the strategy that we can exploit, which is sending an instruction to reconnect immediately before disconnecting them.

Properly handled, this has the impact of eliminating the reconnection delay because it only kicks in when a disconnection was initiated by the server. The timing of the solution expressed here is such that the client should never actually see that formal disconnection order because they have already disconnected themselves.

It's still important to formally disconnect the client on the server side because it's possible that the user loses network connectivity or just has their laptop shut when the reconnect message is delivered. In other words, we cannot rely on the client to do things properly, but we can give them the opportunity to do so.

This solution is implemented in the `app/channels/sessions_channel.rb` and `app/javascript/channels/sessions_channel.js`. In addition, I have provided a Stimulus controller at `app/javascript/controllers/connected_controller.js` which can disable a button that it's attached to when Action Cable is not currently connected to the server.

It should be noted that disconnecting the client and optionally sending a `reconnect` instruction are both optional steps. You could have a different strategy for your application. For example, you might want to display a modal prompting the user to reconnect.

A starting point for customization is commented out in `app/javascript/controllers/application_controller.js` where you can see a sample handler for forbidden Reflexes is described. Instead of refreshing the page, you could use a notification library to pop up a toast message, for example.

All said, if you do implement the disconnect/reconnect strategy, 99%+ of the time your user will not even perceive more than a blip during which their buttons can be disabled.

I recommend that to fully experience all three approaches, first run the app as-is so that you can see the log output. Then uncomment the `ActionCable.server.remote_connections` in the three controllers. You will see the Rails 7 randomized fallout in the form of your button being disabled for 8-10 seconds. Finally, uncomment the `cable_ready[SessionsChannel].dispatch_event(name: "reconnect")` calls, which each occur on the line immediately preceeding the server disconnect.

**Note**: This strategy is still evolving; it could be that sending a command to all tabs to reconnect might do harm if the UI is not updated to reflect the authentication context change. A superior solution might be to only send the reconnect to the tab which initiated the context change. Keep an eye on this space for updates.

### The Users channel

I included a solution for sending operations to arbitrary individual users with CableReady, even though it's not currently used in this sample application. Still, it's extremely useful to be able to send CableReady payloads from ActiveJobs, for example.

- `app/channels/users_channel.rb`
- `app/javascript/channels/users_channel.js`

## Opinions and architecture

This project uses [Mrujs](https://mrujs.com) - the spiritual successor to Rails UJS - to handle links that trigger `DELETE` requests as well as morphing form errors. Not only is this library a joy to use, it allows developers to seemlessly handle Devise session and registration actions _without ever requiring a hard refresh_. This is incredibly important because it allows for long-running applications, and it doesn't allow the developer to be lazy about assuming that such a refresh will take care of any permissions concerns. In reality, this assumption breaks down as soon as you have multiple tabs open, making it a habit that needs to die.

To support Mrujs, we set forms to be `remote:true` in `config/application.rb`:

```rb
config.action_view.form_with_generates_remote_forms = true
```

This project doesn't include support for Turbo Frames or Turbo Streams, as they are adjacent to the technology on display here.

The `Gemfile` and `package.json` both rely on pre-release versions of StimulusReflex and CableReady. I will do my best to keep them up to date in advance of the next major release.

I have [Kredis](https://github.com/rails/kredis) and [redis-session-store](https://github.com/roidrage/redis-session-store) commented out in `Gemfile`. In practice, I **strongly** recommend using `redis-session-store` in development and production.

## Credit and acknowledgements

This project started as a fork of [https://github.com/marcoroth](@marcoroth)'s excellent [https://github.com/marcoroth/rails7-stimulus-reflex-esbuild](https://github.com/marcoroth/rails7-stimulus-reflex-esbuild) starter project.

I received much patient advice regarding esbuild from Marco, Konnor and Rob on the [StimulusReflex Discord](https://discord.gg/stimulus-reflex). Thank you, gentlemen.

I take substantial initiative from "[How We Got to LiveView](https://fly.io/blog/how-we-got-to-liveview/)" by Chris McCord. I am particularly inspired by expression of an architectural model where session and request are the same concept. I believe that this is a powerful idea and many of the opinions that drive how this application works are steps towards enabling this model in the Rails ecosystem.
