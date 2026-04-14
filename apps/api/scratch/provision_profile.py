
import os
import sys
from supabase import create_client, ClientOptions

# Add the app directory to sys.path to import settings
sys.path.append(os.getcwd())

def provision_user():
    # Load environment variables manually if needed, or rely on them being present
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_service_key = os.getenv("SUPABASE_SERVICE_KEY")
    
    if not supabase_url or not supabase_service_key:
        print("Error: SUPABASE_URL or SUPABASE_SERVICE_KEY is missing.")
        return

    # User ID from console logs
    target_user_id = "3dba4613-2eda-4b82-9a0d-8ca7b6f5c706"
    
    print(f"Connecting to Supabase at {supabase_url}...")
    
    supabase = create_client(
        supabase_url, 
        supabase_service_key,
        options=ClientOptions(
            headers={
                "apikey": supabase_service_key,
                "Accept": "application/json"
            }
        )
    )
    
    print(f"Upserting profile for user {target_user_id}...")
    
    profile_data = {
        "id": target_user_id,
        "email": "jason@nitisetu.gov.in", # Assuming based on context
        "full_name": "Jason Admin",
        "role": "admin",
        "designation": "Master Administrator",
        "zone": "Central Zone"
    }
    
    try:
        result = supabase.from_("profiles").upsert(profile_data).execute()
        print("Profile successfully provisioned!")
        print(result.data)
    except Exception as e:
        print(f"Error provisioning profile: {str(e)}")

if __name__ == "__main__":
    provision_user()
