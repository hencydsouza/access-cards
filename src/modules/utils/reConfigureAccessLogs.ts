import mongoose from "mongoose";
import { AccessLog } from "../accessLog";
import { logger } from "../logger";

export default async function reConfigureAccessLogs(interval: number) {
    const accessLogs = await AccessLog.aggregate([
        { $unwind: "$logs" },
        { $replaceRoot: { newRoot: "$logs" } },
        { $sort: { "logs.timestamp": 1 } },
        // { $unset: "_id" }
    ]);

    // log type
    type Log = {
        bucketStartTime: Date;
        bucketEndTime: Date;
        logs: {
            accessCardId: mongoose.Types.ObjectId;
            employeeId: mongoose.Types.ObjectId;
            buildingId: mongoose.Types.ObjectId;
            companyId: mongoose.Types.ObjectId;
            accessType: string;
            eventType: string;
            timestamp: Date;
        }[]
    }

    const newLogs: Log[] = []

    accessLogs.forEach(log => {
        const currentBucket = newLogs[newLogs.length - 1];
        const newLogEntry = {
            accessCardId: log.accessCardId.toString(),
            employeeId: log.employeeId.toString(),
            buildingId: log.buildingId.toString(),
            companyId: log.companyId.toString(),
            eventType: log.eventType,
            accessType: log.accessType,
            timestamp: log.timestamp
        };

        if (!currentBucket || log.timestamp >= currentBucket.bucketEndTime) {
            newLogs.push({
                bucketStartTime: log.timestamp,
                bucketEndTime: new Date(log.timestamp.getTime() + interval * 1000),
                logs: [newLogEntry]
            });
        } else {
            currentBucket.logs.push(newLogEntry);
        }
    });

    // delete old access logs
    await AccessLog.deleteMany({})
    // insert new logs
    await AccessLog.insertMany(newLogs)

    logger.info("Access logs re-configured with interval: " + (interval / 3600) + " hours")
}