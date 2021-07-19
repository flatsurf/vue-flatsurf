from rever.activity import activity

try:
  input("Are you sure you are on the master branch which is identical to origin/master? [ENTER]")
except KeyboardInterrupt:
  sys.exit(1)

@activity
def publish():
  yarn
  yarn build
  yarn publish --new-version $VERSION

$PROJECT = 'vue-flatsurf'

$ACTIVITIES = [
    'version_bump',
    'changelog',
    'tag',
    'push_tag',
    'ghrelease',
    'publish',
]

$VERSION_BUMP_PATTERNS = [
    ('package.json', r'"version":', r'  "version": "$VERSION",'),
]

$CHANGELOG_FILENAME = 'ChangeLog'
$CHANGELOG_TEMPLATE = 'TEMPLATE.rst'
$CHANGELOG_NEWS = 'news'
$CHANGELOG_CATEGORIES = ('Added', 'Changed', 'Removed', 'Fixed')
$PUSH_TAG_REMOTE = 'git@github.com::flatsurf/vue-flatsurf.git'

$GITHUB_ORG = 'flatsurf'
$GITHUB_REPO = 'vue-flatsurf'
