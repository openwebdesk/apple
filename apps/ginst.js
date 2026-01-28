async (params, api) => {
    const id = await api.cli.write("Fetching...");
    let fetched = await api.network.fetchText(params[0]);
    await api.cli.edit(id, "Creating files...");
    let name = "";
    while (true) {
        name = await api.cli.ask("Enter a name for the Application:");
        if (name !== "" && !name.includes(".")) break;
        await api.cli.edit(id, "Application names shouldn't be empty or have a file extension.");
    }
    await api.files.mkFile("root/apps/" + name + ".js", fetched)
    await api.cli.edit(id, "Installation Complete!");
		apple.end();
}
