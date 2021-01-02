
import DocWatcher, { DocWatcherType } from "./../models/docWatcher";

export const addUserToWatchersList = async (docId: number, userId: number): Promise<DocWatcher | null> => {
    let watcher: DocWatcher | null = await DocWatcher.findOne({
        where: { docId, userId }
    });

    if (!watcher) {
        try {
            watcher = await DocWatcher.create({
                userId,
                docId,
                watcherType: DocWatcherType.Watcher
            });
        }
        catch (err) {

        }

    }
    else {
        await DocWatcher.update({ watcherType: DocWatcherType.Watcher }, { where: { id: watcher.id } });
        watcher.watcherType = DocWatcherType.Watcher;
    }
    return watcher;
}

export const deleteUserFromWatchers = async (docId: number, userId: number): Promise<void> => {
    await DocWatcher.destroy({ where: { docId, userId } });
}

export const unWatch = async (docId: number, userId: number): Promise<void> => {
    const watcher: DocWatcher | null = await DocWatcher.findOne({
        where: { docId, userId }
    });

    if (watcher) {
        await DocWatcher.update({ watcherType: DocWatcherType.NonWatcher }, { where: { id: watcher.id } });
    } else {
        await DocWatcher.create({
            userId,
            docId,
            watcherType: DocWatcherType.NonWatcher
        });
    }
}


export const getwatchersForDoc = async (docId: number): Promise<number[]> => {
    let watchers: DocWatcher[] = await DocWatcher.findAll({
        attributes: ["userId"],
        where: {
            docId,
            watcherType: DocWatcherType.Watcher
        }
    });

    return watchers.map((watcher) => watcher.userId)
}


export const addUsersToWatcherList = async (docId: number, userIds: number[]): Promise<DocWatcher[]> => {
    if (userIds.length === 0) {
        return []
    }

    const itemsToAdd: any[] = userIds.map((id: number) => {
        return {
            docId,
            watcherType: DocWatcherType.Watcher,
            userId: id
        }
    });
    return await DocWatcher.bulkCreate(itemsToAdd);
}