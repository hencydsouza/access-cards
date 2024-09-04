import mongoose from "mongoose"
import { AccessCard } from "../accessCard"
import { AccessLog } from "../accessLog"
import { Building } from "../building"
import { Company } from "../company"
import { IEmployeeDoc } from "../employee/employee.interfaces"
// import { IDashboard } from "./dashboard.interfaces"

export const getDashboardData = async (scope: string, employee: IEmployeeDoc) => {
    let result = {
        buildings: 0,
        companies: 0,
        access_card: {},
        access_logs: {}
    }

    const accessCardStage = {
        '$group': {
            '_id': null,
            'total_count': {
                '$sum': 1
            },
            'inactive_count': {
                '$sum': {
                    '$cond': {
                        'if': {
                            '$eq': [
                                '$is_active', false
                            ]
                        },
                        'then': 1,
                        'else': 0
                    }
                }
            }
        }
    }

    await Promise.all([Building.find().count(), scope === "building" ? Company.find({ "buildings.buildingId": employee.company.buildingId }).count() : Company.find().count(), AccessCard.aggregate([
        {
            '$match': scope === 'product'
                ? {}
                : scope === 'company'
                    ? {
                        "cardHolder.companyId": new mongoose.Types.ObjectId(employee.company.companyId)
                    } : {
                        "cardHolder.buildingId": new mongoose.Types.ObjectId(employee.company.buildingId)
                    }
        },
        accessCardStage
    ]),
    AccessLog.aggregate(
        [
            {
                '$unwind': '$logs'
            },
            {
                '$match': scope === 'product'
                    ? {}
                    : scope === 'company'
                        ? {
                            "logs.companyId": new mongoose.Types.ObjectId(employee.company.companyId)
                        }
                        : {
                            "logs.buildingId": new mongoose.Types.ObjectId(employee.company.buildingId)
                        }
            },
            {
                '$group': {
                    '_id': {
                        '$dateToString': {
                            'format': '%Y-%m-%d',
                            'date': '$logs.timestamp'
                        }
                    },
                    'count': {
                        '$sum': 1
                    }
                }
            }, {
                '$sort': {
                    '_id': -1
                }
            }
        ]
    )
    ]).then(res => {
        result.buildings = res[0]
        result.companies = res[1]
        result.access_card = res[2][0]
        result.access_logs = res[3].slice(0, 6)
    })
    return result
}