const groupService = require("../services/groups.service");

exports.createGroup = async (request, response) => {
    try {
        const result = await groupService.createGroup(request.body);
        response.status(201).json(result);
    }
    catch (error) {
        response.status(500).json({ error: "Failed to create group" });
    }
};

exports.setShowGraphs = async (request, response) => {
    try {
        const result = await groupService.setShowGraphs(request.params.groupCode, request.body);
        response.status(201).json(result);
    }
    catch (error) {
        response.status(500).json({ error: "Failed to set graph visibility" });
    }
};

exports.getShowGraphs = async (request, response) => {
    try {
        const showGraphs = await groupService.getShowGraphs(request.params.groupCode);
        response.status(200).json(showGraphs);
    }
    catch {
        response.status(404).json({ error: "Group not found" });
    }
};

exports.getGroup = async (request, response) => {
    try {
        const group = await groupService.getGroup(request.params.groupCode);
        response.status(200).json({
            week: group.week,
            showGraphs: group.showGraphs,
            games: group.games.map(game => game.roomCode),
        });
    }
    catch {
        response.status(404).json({ error: "Group not found" });
    }
};

exports.listGroups = async (request, response) => {
    const groups = await groupService.listGroups();
    response.status(200).json(groups);
};
