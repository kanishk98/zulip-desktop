# Configuring Zulip Desktop for multiple users

If you're a system admin and want to add certain organizations to the Zulip app for
all users of your system, you can do so by creating an enterprise config file.
The file should be placed at `/etc/zulip-desktop-config` for Linux and macOS computers
and inside `C:\Program Files\Zulip-Desktop-Config` on Windows.
It must be named `enterprise_config.json` in both cases. 

To specify the preset organization you want to add for other users, you will need to
add the `json` shown below to the `enterprise_config.json`, replace `https://chat.zulip.org` to the
organization you want to add, you can also specify multiple organizations. 

```json
{
	"presetOrganizations": {
		"value": ["https://chat.zulip.org"],
		"isAdminOnly": true 
	}
}
```

The above example adds [Zulip Community](https://chat.zulip.org) to Zulip every time the app is loaded. 
The `isAdminOnly` field decides if you want to allow your users to be able to remove the organization or not. In the example above, the user will not be allowed to remove the organization. 
Users can add new organizations at all times.

If you'd like to remove organizations and have admin access, you'll need to change the config file to either set `isAdminOnly` to `true` or remove the concerned URL from the `value` field.
