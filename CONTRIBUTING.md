# Contributing

When contributing to this repository, please first discuss the change you wish to make via issues with the owners of this repository before making a change.

## Pull Request Process

1. `yarn lint` and `yarn test` your commit before creating a pr
2. please follow [conventional commit conventions](https://www.conventionalcommits.org/en/v1.0.0/)¹

**Example**¹

```bash
# here are some examples for the most common commands
# have a look at the linked ressource to get a full picture
git commit -m "fix: <function> now returns correct value" # will result in a patch 1.0.x
git commit -m "docs: enhance usage docs for <function>"
git commit -m "feat: add sth great" # will result in a minor release 1.x.0

# if your commit is breaking, you might either describe it in the commit message
git commit -m "perf: speedup <function> calculation

BREAKING CHANGE: While this doesn't alter functionality it alters the return type,
which might potentially be breaking" # will result in a major x.0.0
# or you can just indicate it with an `!`
git commit -m "fix!: <function> types now reflect the actual output" # will result in a major x.0.0

```

## Release process

To propose a new release you have to create a branch, run `yarn release:prod` and create a pr for that branch.
Once the branch is merged to master a npm release will be published automatically.

```bash
# make sure you're on latest master before doing this
git fetch # fetch latest tags
git checkout -b <branch>
yarn release:prod
git push origin <branch>
```
