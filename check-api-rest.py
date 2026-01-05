#!/usr/bin/env python3
"""
Check Cloud Run API status using REST API (bypasses shell issues)
"""
import subprocess
import json
import urllib.request
import urllib.parse

PROJECT_ID = "gen-lang-client-0803362165"
REGION = "asia-south1"
SERVICE = "whatsay-api"

def get_access_token():
    """Get GCP access token"""
    try:
        result = subprocess.run(
            ["gcloud", "auth", "print-access-token"],
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.returncode == 0:
            return result.stdout.strip()
        return None
    except Exception as e:
        print(f"Error getting token: {e}")
        return None

def check_service_via_api():
    """Check service status via REST API"""
    token = get_access_token()
    if not token:
        print("❌ Could not get access token")
        return None
    
    url = f"https://run.googleapis.com/v1/projects/{PROJECT_ID}/locations/{REGION}/services/{SERVICE}"
    
    try:
        req = urllib.request.Request(url)
        req.add_header("Authorization", f"Bearer {token}")
        
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())
            service_url = data.get("status", {}).get("url", "")
            conditions = data.get("status", {}).get("conditions", [])
            
            if service_url:
                print(f"✅ API DEPLOYED!")
                print(f"URL: {service_url}")
                
                # Check health
                try:
                    health_req = urllib.request.Request(f"{service_url}/health")
                    with urllib.request.urlopen(health_req, timeout=5) as health_resp:
                        health_data = health_resp.read().decode()
                        print(f"Health: {health_data}")
                except Exception as e:
                    print(f"Health check failed: {e}")
                
                return service_url
            else:
                print("⏳ Service exists but URL not ready")
                for condition in conditions:
                    print(f"  {condition.get('type')}: {condition.get('status')}")
                return None
                
    except urllib.error.HTTPError as e:
        if e.code == 404:
            print("⏳ Service not found - may still be deploying")
        else:
            print(f"❌ Error: {e.code} - {e.read().decode()}")
        return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

if __name__ == "__main__":
    print("🔍 Checking API via REST API...")
    print("")
    url = check_service_via_api()
    exit(0 if url else 1)
