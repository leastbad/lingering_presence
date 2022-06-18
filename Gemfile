source "https://rubygems.org"
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby "3.1.0"

gem "rails", "~> 7.0.2", ">= 7.0.2.3"
gem "sprockets-rails"
gem "jsbundling-rails"
gem "pg", "~> 1.1"
gem "puma", "~> 5.0"
gem "redis", "~> 4.2"

# gem "redis-session-store"
# gem "kredis"

gem "devise"
gem "cable_ready", github: "stimulusreflex/cable_ready", branch: "master"
gem "stimulus_reflex", github: "stimulusreflex/stimulus_reflex", branch: "master"

gem "linger", "0.1.0"

gem "tzinfo-data", platforms: %i[ mingw mswin x64_mingw jruby ]
gem "bootsnap", require: false

group :development, :test do
  gem "debug", platforms: %i[ mri mingw x64_mingw ]
end

group :development do
  gem "web-console"
  gem "ruby_jard"
end

group :test do
  gem "capybara"
  gem "selenium-webdriver"
  gem "webdrivers"
end