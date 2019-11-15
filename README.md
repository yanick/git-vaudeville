# Git-Vaudeville

`git-vaudeville` is a simple git hook management system. It is
language-agnostic, and allows to have global and per-project hooks.

## Installation

    npm install -g git-vaudeville

## Usage

To unleash the power of `git-vaudeville`, first you need
to enable it on a given repository:

```
$ cd ~/work/my-repo
$ git-vaudeville install
```

The install will create shims for `vaudeville` in `.git/hooks` (if scripts
already exist there, they will be safely moved to a timestamped backup
subdirectory). It will also create a `.git/hooks/vaudeville` directory
with subdirectories for each type of git hook.

Then you may drop scripts in either those local `vaudeville` directories,
or in the global `~/git/vaudeville/_hook-type_` directory. Those scripts can
be written in any language, as long as they are executable, it's all :100:.

You can get a summary of the hooks that are active for
a given repository via `git vaudeville info`:

```
$ git vaudeville info
Vaudeville directories
 - /home/yanick/git-vaudeville
 - ./.git/hooks/vaudeville
pre-commit
 - foo
    .git/hooks/vaudeville
pre-push
 - do-not-push.fish
    ~/git-vaudeville - don't push if string 'DO NOT PUSH' is present
```

And... that's it. Now vaudeville will call all the pertinent
scripts for each phase.

## Commands

### `git vaudeville info`

Provides a report of the directories `vaudeville` looks at
for hook scripts, as well as all the hooks it found.

If a script contains a line beginning with `ABSTRACT:`, it
is used as its description in the listing.

### `git vaudeville install`

Installs the vaudeville shims locally in the current repository.
If scripts already exist in `.git/hooks`, they are safely
copied in a timestamped subdirectories.

The installation also creates `.git/hooks/vaudeville` and its
subdirectories.

### `git vaudeville run <phase>`

Runs all the hooks for a given `phase`.
Typically you won't run it manually, but can be useful for testing /
debugging.

Bear in mind that most hooks expect to get information via `stdin`. I.e.,
you'll likely have to call it like so:

```
$ echo "dummy HEAD dummy HEAD^" | git vaudeville run pre-push

# or

$ git vaudeville run pre-push --stdin "dummy HEAD dummy HEAD^"
```

### `git vaudeville help`

Prints the list of commands.

## Configuration

### Vaudeville directories

By default Vaudeville looks for hooks in the global directory `~/git/vaudeville` and
the local directory `./.git/hooks/vaudevilles`. This can be customized via the
git configuration key `vaudeville.dirs`. For example, to use
`~/git/vaudeville` (for global hooks), `./.git/hooks/vaudeville` (for local
private hooks), and `./git-hooks` (for public local hooks):

```
$ git config --global vaudeville.dirs ~/git/vaudeville,./.git/hooks/vaudeville,./git-hooks
```

## Custom hook phases

It's totally possible to add custom hook phases by adding subdirectories of
scripts in the vaudeville directories.

For example, I have a command `git-integrate` that merges work back
to a main branch after running a bunch of checks:

```
#!/usr/bin/env fish

set -l branch $argv[1]

if test -z $branch
    set branch master
end

git vaudeville run integrate ( git rev-parse HEAD) $branch

and git checkout $branch

and git merge --no-ff -
```

## Alternatives

- [git-hooks](https://github.com/icefox/git-hooks). (although
  you might want to use Sweth's [maintained
  fork](https://github.com/sweth/git-hooks)) Shell-based, very
  close to vaudeville. Main difference is `git-hooks` wants the
  hooks to live in the repo (under `./git-hooks`), whereas
  `vaudeville` hides them under `.git/hooks/vaudeville`.

## Thanks

Mad props go to Gizmo Mathboy to have come up with the name
[Vaudeville](https://twitter.com/gizmomathboy/status/1174495897532715008).
