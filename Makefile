create-extension:
	tfx extension create --manifest-globs vss-extension.json

publish-extension:
	tfx extension publish --manifest-globs vss-extension.json