# frozen_string_literal: true

class Users::SessionsController < Devise::SessionsController
  def create
    prev_session_id = session.id.to_s

    super do
      session.options[:id] = session.instance_variable_get(:@by).generate_sid
      session.options[:renew] = false
      
      Linger.deny prev_session_id
      Linger.allow session, current_user
      
      # cable_ready[SessionsChannel].dispatch_event(name: "reconnect").broadcast_to(request.session.id)
      # ActionCable.server.remote_connections.where(session_id: prev_session_id, current_user: nil).disconnect
    end
  end

  def destroy
    prev_session_id = session.id.to_s
    old_user = current_user
    
    signed_out = (Devise.sign_out_all_scopes ? sign_out : sign_out(resource_name))

    set_flash_message! :notice, :signed_out if signed_out

    Linger.deny prev_session_id, old_user
    Linger.allow session
    
    # cable_ready[SessionsChannel].dispatch_event(name: "reconnect").broadcast_to(request.session.id)
    # ActionCable.server.remote_connections.where(session_id: prev_session_id, current_user: old_user).disconnect
    
    redirect_to after_sign_out_path_for(resource_name)
  end

  private

  def verify_signed_out_user
    if all_signed_out?
      set_flash_message! :notice, :already_signed_out
      redirect_to after_sign_out_path_for(resource_name)
    end
  end
end