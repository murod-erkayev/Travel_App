import * as winston from "winston";
import { utilities as nestWinstonModuleUtilities } from 'nest-winston'; 

export const winstonConfig= {
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.label({ label: "Prismajon" }),
        nestWinstonModuleUtilities.format.nestLike("Prismajon") 
      )
    }),
    new winston.transports.File({
      filename:"logs/combine.log",
      level:"info",
      format:winston.format.combine(
        winston.format.label({label:"Prismajon"}),
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
    new winston.transports.File({
      filename:"logs/error.log",
      level:"error",
      format:winston.format.combine(
        winston.format.label({label:"Prismajon"}),
        winston.format.timestamp(),
        winston.format.json()
      ),
    })
  ]
};
