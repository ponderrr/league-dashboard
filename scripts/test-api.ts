import { sleeperApi } from '../lib/sleeper/client';

// Test with a known Sleeper username (using a popular one for testing)
const TEST_USERNAME = 'sleeper';
const TEST_LEAGUE_ID = '997862469399789568'; // Example league ID (you can replace with a real one)

async function testAPI() {
  console.log('🧪 Testing Sleeper API Integration\n');
  console.log('=' .repeat(50));

  try {
    // Test 1: Get user by username
    console.log('\n1️⃣ Testing getUser(username)...');
    try {
      const user = await sleeperApi.getUser(TEST_USERNAME);
      console.log('✅ getUser(username) - SUCCESS');
      console.log(`   User ID: ${user.user_id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Display Name: ${user.display_name}`);
    } catch (error: any) {
      console.log('❌ getUser(username) - FAILED');
      console.log(`   Error: ${error.message}`);
    }

    // Test 2: Get user by ID (if we got a user above)
    console.log('\n2️⃣ Testing getUserById(userId)...');
    try {
      const user = await sleeperApi.getUser(TEST_USERNAME);
      const userById = await sleeperApi.getUserById(user.user_id);
      console.log('✅ getUserById(userId) - SUCCESS');
      console.log(`   Username: ${userById.username}`);
    } catch (error: any) {
      console.log('❌ getUserById(userId) - FAILED');
      console.log(`   Error: ${error.message}`);
    }

    // Test 3: Get user leagues
    console.log('\n3️⃣ Testing getUserLeagues(userId, sport, season)...');
    try {
      const user = await sleeperApi.getUser(TEST_USERNAME);
      const leagues = await sleeperApi.getUserLeagues(user.user_id, 'nfl', '2024');
      console.log('✅ getUserLeagues() - SUCCESS');
      console.log(`   Found ${leagues.length} leagues for 2024`);
      if (leagues.length > 0) {
        console.log(`   First league: ${leagues[0].name} (${leagues[0].league_id})`);
      }
    } catch (error: any) {
      console.log('❌ getUserLeagues() - FAILED');
      console.log(`   Error: ${error.message}`);
    }

    // Test 4: Get league
    console.log('\n4️⃣ Testing getLeague(leagueId)...');
    try {
      const league = await sleeperApi.getLeague(TEST_LEAGUE_ID);
      console.log('✅ getLeague() - SUCCESS');
      console.log(`   League: ${league.name}`);
      console.log(`   Season: ${league.season}`);
      console.log(`   Teams: ${league.total_rosters}`);
    } catch (error: any) {
      console.log('❌ getLeague() - FAILED');
      console.log(`   Error: ${error.message}`);
    }

    // Test 5: Get league rosters
    console.log('\n5️⃣ Testing getLeagueRosters(leagueId)...');
    try {
      const rosters = await sleeperApi.getLeagueRosters(TEST_LEAGUE_ID);
      console.log('✅ getLeagueRosters() - SUCCESS');
      console.log(`   Found ${rosters.length} rosters`);
      if (rosters.length > 0) {
        console.log(`   First roster: ${rosters[0].roster_id} (${rosters[0].players.length} players)`);
      }
    } catch (error: any) {
      console.log('❌ getLeagueRosters() - FAILED');
      console.log(`   Error: ${error.message}`);
    }

    // Test 6: Get league users
    console.log('\n6️⃣ Testing getLeagueUsers(leagueId)...');
    try {
      const users = await sleeperApi.getLeagueUsers(TEST_LEAGUE_ID);
      console.log('✅ getLeagueUsers() - SUCCESS');
      console.log(`   Found ${users.length} users`);
      if (users.length > 0) {
        console.log(`   First user: ${users[0].display_name} (@${users[0].username})`);
      }
    } catch (error: any) {
      console.log('❌ getLeagueUsers() - FAILED');
      console.log(`   Error: ${error.message}`);
    }

    // Test 7: Get league matchups (week 1)
    console.log('\n7️⃣ Testing getLeagueMatchups(leagueId, week)...');
    try {
      const matchups = await sleeperApi.getLeagueMatchups(TEST_LEAGUE_ID, 1);
      console.log('✅ getLeagueMatchups() - SUCCESS');
      console.log(`   Found ${matchups.length} matchups for week 1`);
      if (matchups.length > 0) {
        console.log(`   First matchup: Roster ${matchups[0].roster_id} - ${matchups[0].points} points`);
      }
    } catch (error: any) {
      console.log('❌ getLeagueMatchups() - FAILED');
      console.log(`   Error: ${error.message}`);
    }

    // Test 8: Get league drafts
    console.log('\n8️⃣ Testing getLeagueDrafts(leagueId)...');
    try {
      const drafts = await sleeperApi.getLeagueDrafts(TEST_LEAGUE_ID);
      console.log('✅ getLeagueDrafts() - SUCCESS');
      console.log(`   Found ${drafts.length} drafts`);
      if (drafts.length > 0) {
        console.log(`   First draft: ${drafts[0].draft_id} (${drafts[0].status})`);
      }
    } catch (error: any) {
      console.log('❌ getLeagueDrafts() - FAILED');
      console.log(`   Error: ${error.message}`);
    }

    // Test 9: Get all players (this is a large request, so we'll just test if it starts)
    console.log('\n9️⃣ Testing getAllPlayers(sport)...');
    try {
      // This is a very large request, so we'll just verify it doesn't error immediately
      console.log('   ⏳ Fetching players (this may take a moment)...');
      const players = await sleeperApi.getAllPlayers('nfl');
      const playerCount = Object.keys(players).length;
      console.log('✅ getAllPlayers() - SUCCESS');
      console.log(`   Found ${playerCount} players`);
      if (playerCount > 0) {
        const firstPlayerId = Object.keys(players)[0];
        console.log(`   Example player: ${players[firstPlayerId].full_name} (${players[firstPlayerId].position})`);
      }
    } catch (error: any) {
      console.log('❌ getAllPlayers() - FAILED');
      console.log(`   Error: ${error.message}`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ API Testing Complete!\n');

  } catch (error: any) {
    console.error('\n❌ Unexpected error:', error);
    process.exit(1);
  }
}

testAPI();

