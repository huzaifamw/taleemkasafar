#!/bin/bash

###############################################################################
# PU Lahore Entry Test - Deployment Script
# 
# This script deploys the PU test to Supabase database in correct sequence
# with validation checks at each step.
#
# Usage:
#   ./scripts/deploy_pu_test.sh [environment]
#
# Arguments:
#   environment: staging|production (default: staging)
#
# Prerequisites:
#   - psql installed
#   - Database connection URL in environment variable: SUPABASE_DB_URL
#   - Or prompted for connection string
###############################################################################

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT="${1:-staging}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MIGRATIONS_DIR="$PROJECT_ROOT/supabase/migrations"
MCQS_DIR="$PROJECT_ROOT/mcqs"

###############################################################################
# Helper Functions
###############################################################################

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

prompt_continue() {
    read -p "$(echo -e ${YELLOW}Continue? [y/N]:${NC} )" -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_error "Deployment aborted by user"
        exit 1
    fi
}

check_file_exists() {
    if [ ! -f "$1" ]; then
        log_error "Required file not found: $1"
        exit 1
    fi
}

run_sql() {
    local sql_file=$1
    local description=$2
    
    log_info "Executing: $description"
    log_info "File: $(basename $sql_file)"
    
    if psql "$DB_URL" -f "$sql_file" 2>&1 | tee /tmp/deploy_output.log; then
        log_success "$description completed"
        return 0
    else
        log_error "$description failed"
        log_error "Check /tmp/deploy_output.log for details"
        return 1
    fi
}

###############################################################################
# Pre-Flight Checks
###############################################################################

echo "========================================================================"
echo " PU Lahore Entry Test - Deployment Script"
echo "========================================================================"
echo
log_info "Environment: $ENVIRONMENT"
log_info "Project Root: $PROJECT_ROOT"
echo

# Check psql is installed
if ! command -v psql &> /dev/null; then
    log_error "psql not found. Please install PostgreSQL client tools."
    exit 1
fi

# Get database URL
if [ -z "${SUPABASE_DB_URL:-}" ]; then
    log_warning "SUPABASE_DB_URL environment variable not set"
    echo -n "Enter Supabase database connection URL: "
    read -s DB_URL
    echo
else
    DB_URL="$SUPABASE_DB_URL"
    log_info "Using SUPABASE_DB_URL from environment"
fi

# Validate DB connection
log_info "Testing database connection..."
if ! psql "$DB_URL" -c "SELECT 1;" > /dev/null 2>&1; then
    log_error "Cannot connect to database"
    exit 1
fi
log_success "Database connection successful"
echo

# Check required files exist
log_info "Checking required files..."
check_file_exists "$MIGRATIONS_DIR/20260820000000_add_pu_test.sql"
check_file_exists "$MIGRATIONS_DIR/20260820100000_add_pu_topics.sql"
check_file_exists "$MIGRATIONS_DIR/20260820200000_add_pu_blueprint.sql"
check_file_exists "$MCQS_DIR/import_pu.sql"
check_file_exists "$MCQS_DIR/validate_pu_import.sql"
check_file_exists "$MCQS_DIR/test_pu_mock_generation.sql"
log_success "All required files present"
echo

# Check if PU test already exists
log_info "Checking if PU test already exists..."
if psql "$DB_URL" -t -c "SELECT EXISTS(SELECT 1 FROM entry_tests WHERE slug = 'pu');" | grep -q 't'; then
    log_warning "PU test already exists in database!"
    echo
    echo "This script will:"
    echo "  1. Skip migrations (tables already exist)"
    echo "  2. Attempt to import questions (may fail if duplicates exist)"
    echo
    echo "To do a clean install:"
    echo "  1. Backup existing data"
    echo "  2. Run: DELETE FROM entry_tests WHERE slug = 'pu';"
    echo "  3. Re-run this script"
    echo
    prompt_continue
fi
echo

###############################################################################
# Deployment Steps
###############################################################################

log_info "Starting PU Test deployment..."
echo

# Step 1: Migration 1 - Entry Test and Subjects
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "STEP 1/6: Creating PU Entry Test and Subjects"
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if ! run_sql "$MIGRATIONS_DIR/20260820000000_add_pu_test.sql" "Migration 1 (Test + Subjects)"; then
    log_warning "Migration 1 failed (may already exist). Continuing..."
fi
echo

# Verify Step 1
log_info "Verifying entry test creation..."
TEST_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM entry_tests WHERE slug = 'pu';")
SUBJECT_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM test_subjects WHERE entry_test_id = (SELECT id FROM entry_tests WHERE slug = 'pu');")

if [ "$TEST_COUNT" -eq 1 ] && [ "$SUBJECT_COUNT" -eq 5 ]; then
    log_success "✓ Entry test and 5 subjects created"
else
    log_error "✗ Verification failed (Test: $TEST_COUNT, Subjects: $SUBJECT_COUNT)"
    exit 1
fi
echo

# Step 2: Migration 2 - Topics
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "STEP 2/6: Creating 48 Topics"
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if ! run_sql "$MIGRATIONS_DIR/20260820100000_add_pu_topics.sql" "Migration 2 (Topics)"; then
    log_warning "Migration 2 failed (may already exist). Continuing..."
fi
echo

# Verify Step 2
log_info "Verifying topics creation..."
TOPIC_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM topics WHERE chapter_id IN (SELECT c.id FROM chapters c JOIN test_subjects ts ON ts.subject_id = c.subject_id JOIN entry_tests et ON et.id = ts.entry_test_id WHERE et.slug = 'pu');")

if [ "$TOPIC_COUNT" -eq 48 ]; then
    log_success "✓ 48 topics created"
else
    log_error "✗ Verification failed (Topics: $TOPIC_COUNT, Expected: 48)"
    exit 1
fi
echo

# Step 3: Migration 3 - Mock Blueprint
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "STEP 3/6: Creating Mock Test Blueprint"
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if ! run_sql "$MIGRATIONS_DIR/20260820200000_add_pu_blueprint.sql" "Migration 3 (Blueprint)"; then
    log_warning "Migration 3 failed (may already exist). Continuing..."
fi
echo

# Verify Step 3
log_info "Verifying blueprint creation..."
BLUEPRINT_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM mock_test_blueprints WHERE external_id = 'pu-full-mock';")
SLOT_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM mock_blueprint_slots WHERE blueprint_id = (SELECT id FROM mock_test_blueprints WHERE external_id = 'pu-full-mock');")

if [ "$BLUEPRINT_COUNT" -eq 1 ] && [ "$SLOT_COUNT" -eq 5 ]; then
    log_success "✓ Blueprint with 5 slots created"
else
    log_error "✗ Verification failed (Blueprint: $BLUEPRINT_COUNT, Slots: $SLOT_COUNT)"
    exit 1
fi
echo

# Step 4: Import Questions
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "STEP 4/6: Importing 1,444 Questions"
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_warning "This may take 30-60 seconds..."
if ! run_sql "$MCQS_DIR/import_pu.sql" "Question Import"; then
    log_error "Question import failed. Check for duplicate external_ids or constraint violations."
    exit 1
fi
echo

# Step 5: Validate Import
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "STEP 5/6: Validating Import"
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
psql "$DB_URL" -f "$MCQS_DIR/validate_pu_import.sql"
echo

# Check validation results
QUESTION_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM questions WHERE subject_id IN (SELECT s.id FROM subjects s JOIN test_subjects ts ON ts.subject_id = s.id JOIN entry_tests et ON et.id = ts.entry_test_id WHERE et.slug = 'pu');")
OPTION_COUNT=$(psql "$DB_URL" -t -c "SELECT COUNT(*) FROM question_options WHERE question_id IN (SELECT q.id FROM questions q JOIN test_subjects ts ON ts.subject_id = q.subject_id JOIN entry_tests et ON et.id = ts.entry_test_id WHERE et.slug = 'pu');")

if [ "$QUESTION_COUNT" -ge 1440 ] && [ "$OPTION_COUNT" -ge 5800 ]; then
    log_success "✓ Import validation passed (Questions: $QUESTION_COUNT, Options: $OPTION_COUNT)"
else
    log_error "✗ Validation failed (Questions: $QUESTION_COUNT, Options: $OPTION_COUNT)"
    exit 1
fi
echo

# Step 6: Test Mock Generation
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "STEP 6/6: Testing Mock Generation Readiness"
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
psql "$DB_URL" -f "$MCQS_DIR/test_pu_mock_generation.sql"
echo

###############################################################################
# Final Verification
###############################################################################

log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_info "FINAL VERIFICATION"
log_info "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Generate summary report
psql "$DB_URL" <<EOF
SELECT 
  'Entry Test' as component,
  CASE WHEN COUNT(*) = 1 THEN 'PASS ✓' ELSE 'FAIL ✗' END as status
FROM entry_tests WHERE slug = 'pu'

UNION ALL

SELECT 
  'Subjects' as component,
  CASE WHEN COUNT(*) = 5 THEN 'PASS ✓' ELSE 'FAIL ✗' END as status
FROM test_subjects 
WHERE entry_test_id = (SELECT id FROM entry_tests WHERE slug = 'pu')

UNION ALL

SELECT 
  'Topics' as component,
  CASE WHEN COUNT(*) = 48 THEN 'PASS ✓' ELSE 'FAIL ✗' END as status
FROM topics 
WHERE chapter_id IN (
  SELECT c.id FROM chapters c
  JOIN test_subjects ts ON ts.subject_id = c.subject_id
  JOIN entry_tests et ON et.id = ts.entry_test_id
  WHERE et.slug = 'pu'
)

UNION ALL

SELECT 
  'Questions' as component,
  CASE WHEN COUNT(*) >= 1440 THEN 'PASS ✓' ELSE 'FAIL ✗' END as status
FROM questions 
WHERE subject_id IN (
  SELECT s.id FROM subjects s
  JOIN test_subjects ts ON ts.subject_id = s.id
  JOIN entry_tests et ON et.id = ts.entry_test_id
  WHERE et.slug = 'pu'
)

UNION ALL

SELECT 
  'Mock Blueprint' as component,
  CASE WHEN COUNT(*) = 1 THEN 'PASS ✓' ELSE 'FAIL ✗' END as status
FROM mock_test_blueprints 
WHERE external_id = 'pu-full-mock';
EOF

echo

###############################################################################
# Completion
###############################################################################

log_success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_success " PU LAHORE ENTRY TEST DEPLOYMENT COMPLETE!"
log_success "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo
log_info "Next Steps:"
echo "  1. Restart your application server (if needed)"
echo "  2. Clear frontend cache/rebuild"
echo "  3. Test in UI: Go to dashboard and select 'PU Lahore' from dropdown"
echo "  4. Run integration tests: See docs/PU_INTEGRATION_TEST_PLAN.md"
echo "  5. Monitor for errors in first 24 hours"
echo
log_info "Rollback Instructions:"
echo "  If needed: psql \$DB_URL -c \"DELETE FROM entry_tests WHERE slug = 'pu';\""
echo
log_success "Deployment log saved to: /tmp/deploy_output.log"
echo

exit 0
