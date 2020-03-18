
import { IDocWatcherInstance, DocWatcherType } from "./../models/docWatcher";
import db from "../models";


export const addUserToWatchersList = async (docId: number, userId: number): Promise<IDocWatcherInstance | null> => {
    let watcher: IDocWatcherInstance | null = await db.docWatchers.findOne({
        where: { docId, userId }
    });

    if (!watcher) {
        try {
            watcher = await db.docWatchers.create({
                userId,
                docId,
                watcherType: DocWatcherType.Watcher
            });
        }
        catch (err) {

        }

    }
    else {
        await db.docWatchers.update({ watcherType: DocWatcherType.Watcher }, { where: { id: watcher.id } });
        watcher.watcherType = DocWatcherType.Watcher;
    }
    return watcher;
}

export const unWatch = async (docId: number, userId: number): Promise<void> => {
    const watcher: IDocWatcherInstance | null = await db.docWatchers.findOne({
        where: { docId, userId }
    });

    if (watcher) {
        await db.docWatchers.update({ watcherType: DocWatcherType.NonWatcher }, { where: { id: watcher.id } });
    } else {
        await db.docWatchers.create({
            userId,
            docId,
            watcherType: DocWatcherType.NonWatcher
        });
    }
}