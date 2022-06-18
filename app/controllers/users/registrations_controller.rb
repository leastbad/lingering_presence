# frozen_string_literal: true

class Users::RegistrationsController < Devise::RegistrationsController
  def create
    old_session_id = session.id.to_s

    build_resource(sign_up_params)

    resource.save
    
    if resource.persisted?
      session.options[:id] = session.instance_variable_get(:@by).generate_sid
      session.options[:renew] = false

      set_flash_message! :notice, :signed_up
      sign_up(resource_name, resource)

      Linger.deny(old_session_id)
      Linger.allow(session, resource)
      
      # cable_ready[SessionsChannel].dispatch_event(name: "reconnect").broadcast_to(request.session.id)
      # ActionCable.server.remote_connections.where(session_id: old_session_id, current_user: nil).disconnect
      
      respond_with resource, location: after_sign_up_path_for(resource)
    else
      clean_up_passwords resource
      set_minimum_password_length
      respond_with resource, status: 400
    end
  end
end