# Source Control (Git) Workflow

This attempts to outline what the source control workflow looks like.




#### Development Cycle

* Developers will work from `develop` branch.
* New Features will be branched off of `develop`, named `feature/*name*` and merged back in to `develop` when completed.
 - Code Reviews are encouraged before merging, a la GitHub style
* Minor fixes and tweaks may be made directly to `develop`
* At no point should `master` be committed to during development.



#### Release Procedure

When we prepare to release, we will tag candidates on `develop` with a tag pattern of: `alpha/yyyy-mm-dd/001`. When we believe a release is close, the serial pattern of `001` should switch to a `rc01` pattern.

Once a release candidate has been approved by testing, we will merge that tag into `master`, then tag master with `prod/yyyy-mm-dd/master`. This is the tag that will be released.



#### Hot-Fixes

When a bug needs to be fixed in production, make a branch off of the current `prod/yyyy-mm-dd/master` tag; named `hotfix/yyyy-mm-dd/*identifier*`. Make the fix and commit to that branch. To release, use tag pattern `hotfix/yyyy-mm-dd/*identifier*/001`.

When the hotfix is approved, do not merge hotfix branch into `master`. The hotfix, was branched off master, so just add a tag to the existing approved tag with the pattern `prod/yyyy-mm-dd/hotfix/yyyy-mm-dd/001` where the first date pattern is the original production tag's date, and the second date pattern is the hotfix release date.

Once released, merge or cherry-pick the hotfix into the upstream `develop` branch.


--
**A note about merges:**  All merges of feature branches and release to `master` should be performed using the `--no-ff` flag.
