class ApplicationController < ActionController::Base
  include CableReady::Broadcaster

  after_action do
    user_signed_in? ? Linger.allow(session, current_user) : Linger.allow(session)
  end
end
