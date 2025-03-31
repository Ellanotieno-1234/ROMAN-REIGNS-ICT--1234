require('dotenv').config({ path: require('path').resolve(__dirname, '../.env.local') });
const { supabase } = require('../src/lib/supabase.ts');

async function seedAuthLogs() {
  const testLogs = [
    {
      event_type: 'login',
      ip_address: '192.168.1.1',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0)'
    },
    {
      event_type: 'failed_login',
      ip_address: '10.0.0.1',
      user_agent: 'Mozilla/5.0 (Macintosh)'
    },
    {
      event_type: 'logout',
      ip_address: '172.16.0.1',
      user_agent: 'Mozilla/5.0 (Linux)'
    }
  ];

  const { error } = await supabase
    .from('auth_logs')
    .insert(testLogs);

  if (error) {
    console.error('Error seeding auth logs:', error);
  } else {
    console.log('Successfully seeded auth logs');
  }
}

async function seedSecurityEvents() {
  const testEvents = [
    {
      event_type: 'brute_force_attempt',
      severity: 'high',
      description: 'Multiple failed login attempts',
      source_ip: '10.0.0.1'
    },
    {
      event_type: 'suspicious_activity',
      severity: 'medium',
      description: 'Unusual login location',
      source_ip: '192.168.1.100'
    }
  ];

  const { error } = await supabase
    .from('security_events')
    .insert(testEvents);

  if (error) {
    console.error('Error seeding security events:', error);
  } else {
    console.log('Successfully seeded security events');
  }
}

async function main() {
  await seedAuthLogs();
  await seedSecurityEvents();
}

main();
