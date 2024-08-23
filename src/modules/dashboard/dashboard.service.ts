import { AccessCard } from "../accessCard"
import { AccessLog } from "../accessLog"
import { Building } from "../building"
import { Company } from "../company"
// import { IDashboard } from "./dashboard.interfaces"

export const getDashboardData = async () => {
    let result = {
        buildings: 0,
        companies: 0,
        access_card: {},
        access_logs: {}
    }

    await Promise.all([Building.find().count(), Company.find().count(), AccessCard.aggregate([{
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
    }]),
    AccessLog.aggregate(
        [
            {
                '$unwind': '$logs'
            }, {
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