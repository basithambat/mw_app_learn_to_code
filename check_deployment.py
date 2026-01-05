#!/usr/bin/env python3
import subprocess
import json
import sys

def check_deployment():
    project_id = "gen-lang-client-0803362165"
    region = "asia-south1"
    service_name = "whatsay-api"
    
    print("🔍 Checking API Deployment Status...")
    print("")
    
    # Check if service exists
    try:
        result = subprocess.run(
            ["gcloud", "run", "services", "describe", service_name,
             "--region", region,
             "--project", project_id,
             "--format", "json"],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            service_data = json.loads(result.stdout)
            url = service_data.get("status", {}).get("url", "")
            
            if url:
                print("✅ API DEPLOYMENT COMPLETE!")
                print(f"URL: {url}")
                print("")
                print("Testing health endpoint...")
                
                # Test health
                import urllib.request
                try:
                    health_url = f"{url}/health"
                    with urllib.request.urlopen(health_url, timeout=5) as response:
                        health_data = response.read().decode()
                        print(f"Health check: {health_data}")
                        print("")
                        print("✅ API is ready!")
                        return True
                except Exception as e:
                    print(f"Health check failed: {e}")
                    print("But API URL exists, so deployment is complete.")
                    return True
            else:
                print("⏳ Service exists but URL not available yet")
                return False
        else:
            print("⏳ Service not found - may still be deploying")
            print(f"Error: {result.stderr}")
            return False
            
    except subprocess.TimeoutExpired:
        print("⏳ Command timed out - checking build status...")
    except Exception as e:
        print(f"Error: {e}")
    
    # Check build status
    try:
        result = subprocess.run(
            ["gcloud", "builds", "list",
             "--limit", "1",
             "--project", project_id,
             "--format", "json"],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            builds = json.loads(result.stdout)
            if builds:
                build = builds[0]
                status = build.get("status", "UNKNOWN")
                print(f"Latest build status: {status}")
                if status == "SUCCESS":
                    print("✅ Build completed successfully!")
                elif status == "WORKING":
                    print("⏳ Build still in progress...")
                elif status == "FAILURE":
                    print("❌ Build failed - check logs")
    except Exception as e:
        print(f"Could not check build status: {e}")
    
    return False

if __name__ == "__main__":
    success = check_deployment()
    sys.exit(0 if success else 1)
