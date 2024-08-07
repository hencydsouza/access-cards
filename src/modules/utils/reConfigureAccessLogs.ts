import mongoose from "mongoose";
import { AccessLog } from "../accessLog";
import { logger } from "../logger";

export async function reConfigureAccessLogs(interval: number) {
    const accessLogs = await AccessLog.aggregate([
        { $unwind: "$logs" },
        { $replaceRoot: { newRoot: "$logs" } },
        { $sort: { "logs.timestamp": 1 } },
        { $unset: "_id" }
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
            timestamp: Date;
        }[]
    }

    const newLogs: Log[] = []

    accessLogs.forEach(log => {
        // if no logs in newLogs, create a new log bucket
        if (!newLogs.length) {
            newLogs.push({
                bucketStartTime: log.timestamp,
                bucketEndTime: new Date(log.timestamp.getTime() + interval * 1000),
                logs: [
                    {
                        accessCardId: log.accessCardId.toString(),
                        employeeId: log.employeeId.toString(),
                        buildingId: log.buildingId.toString(),
                        companyId: log.companyId.toString(),
                        accessType: log.accessType.toString(),
                        timestamp: log.timestamp
                    }
                ]
            })
        }
        // check if the log is within the last log's bucket
        else if (newLogs[newLogs.length - 1] && log.timestamp < newLogs[newLogs.length - 1]!.bucketEndTime) {
            newLogs[newLogs.length - 1]!.logs.push(
                {
                    accessCardId: log.accessCardId.toString(),
                    employeeId: log.employeeId.toString(),
                    buildingId: log.buildingId.toString(),
                    companyId: log.companyId.toString(),
                    accessType: log.accessType.toString(),
                    timestamp: log.timestamp
                }
            )
        } 
        // create new log bucket
        else {
            newLogs.push({
                bucketStartTime: log.timestamp,
                bucketEndTime: new Date(log.timestamp.getTime() + interval * 1000),
                logs: [
                    {
                        accessCardId: log.accessCardId.toString(),
                        employeeId: log.employeeId.toString(),
                        buildingId: log.buildingId.toString(),
                        companyId: log.companyId.toString(),
                        accessType: log.accessType.toString(),
                        timestamp: log.timestamp
                    }
                ]
            })
        }
    })

    // delete old access logs
    await AccessLog.deleteMany({})
    // insert new logs
    await AccessLog.insertMany(newLogs)

    logger.info("Access logs re-configured with interval: " + (interval/3600) + " hours")
}