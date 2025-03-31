import time
import random
from supabase import create_client, Client
import os
from dotenv import load_dotenv

load_dotenv()

def generate_network_metrics():
    return {
        'latency': round(random.uniform(15, 30), 1),
        'throughput': round(random.uniform(50, 65), 1),
        'packet_loss': round(random.uniform(0.1, 1.0), 1),
        'uptime': round(random.uniform(99.5, 100), 1)
    }

def main():
    supabase: Client = create_client(
        os.getenv('SUPABASE_URL'),
        os.getenv('SUPABASE_KEY')
    )

    while True:
        metrics = generate_network_metrics()
        
        # Insert new metrics
        supabase.table('network_metrics').insert(metrics).execute()
        
        # Keep only the last 24 hours of data
        supabase.rpc('delete_old_network_metrics').execute()
        
        time.sleep(5)  # Generate every 5 seconds

if __name__ == '__main__':
    main()
