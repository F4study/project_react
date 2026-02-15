// Quick Database Update Script
const pool = require('./db');
const fs = require('fs');
const path = require('path');

async function runUpdate() {
  let connection;
  try {
    const sqlFile = path.join(__dirname, '../db_project Default.sql');
    console.log('\n📊 DATABASE UPDATE\n');
    console.log('Reading: db_project Default.sql...\n');

    let sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // Split by statement - keep multi-line intact
    let statements = [];
    let current = '';
    let lines = sqlContent.split('\n');
    
    for (let line of lines) {
      current += line + '\n';
      if (line.trim().endsWith(';')) {
        let stmt = current.trim();
        if (stmt && !stmt.startsWith('--') && !stmt.startsWith('/*!')) {
          statements.push(stmt);
        }
        current = '';
      }
    }

    console.log(`Found ${statements.length} SQL statements\n`);

    connection = await pool.getConnection();
    let success = 0, error = 0;

    for (let i = 0; i < statements.length; i++) {
      let stmt = statements[i].trim();
      if (!stmt) continue;

      let label = stmt.substring(0, 50).replace(/\n/g, ' ') + '...';
      
      try {
        await connection.query(stmt);
        console.log(`✅ [${i + 1}/${statements.length}] ${label}`);
        success++;
      } catch (err) {
        if (err.code === 'ER_TABLE_EXISTS_ERROR' || err.code === 'ER_DUP_KEYNAME' || err.message.includes('already exists')) {
          console.log(`ℹ️  [${i + 1}/${statements.length}] ${label} (exists)`);
        } else {
          console.log(`⚠️  [${i + 1}/${statements.length}] ${label}`);
          console.log(`   ${err.code}: ${err.message.substring(0, 50)}`);
        }
        error++;
      }
    }

    console.log('\n=====================================');
    console.log(`✅ Success: ${success}`);
    console.log(`⚠️  Errors/Exists: ${error}`);
    console.log('=====================================\n');

    // Check tables
    console.log('📋 Checking tables...\n');
    const tables = [
      'subscription_plans', 'user_subscriptions', 'content_types', 'course_content',
      'quiz_drafts', 'quiz_hints', 'user_hint_usage', 'friend_challenges',
      'user_analytics', 'content_access_log'
    ];

    for (let table of tables) {
      try {
        const [rows] = await connection.query(
          `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA='db_project' AND TABLE_NAME=?`,
          [table]
        );
        console.log(rows.length > 0 ? `✅ ${table}` : `❌ ${table}`);
      } catch (e) {
        console.log(`⚠️  ${table}`);
      }
    }

    console.log('\n🎉 DATABASE UPDATE COMPLETE!\n');
    process.exit(0);

  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  } finally {
    if (connection) await connection.release();
  }
}

runUpdate();
