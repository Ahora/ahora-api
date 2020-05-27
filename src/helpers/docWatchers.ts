
import DocWatcher, { DocWatcherType } from "./../models/docWatcher";
import db from "../models";


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