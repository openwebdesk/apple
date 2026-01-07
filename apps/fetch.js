async (params, api) => {
    const id = await api.cli.write("Fetching...");
    let fetched = await api.network.fetchText(params[0]);
    await api.cli.edit(id, fetched);
}
