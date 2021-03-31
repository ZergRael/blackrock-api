import log from "./logger";
import { getToken } from "./token";
import utils from "./utils";
import { GraphQLClient, gql } from "graphql-request";

const endpoint = "https://classic.warcraftlogs.com/api/v2/client";

function validateCode(code: String) {
  if (code.includes(".") || code.length != 16) {
    return false;
  }

  return true;
}

async function getBuffsAndConsummables(code: String) {
  const token = await getToken();

  const gc = new GraphQLClient(endpoint, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  const report = await gc.request(
    gql`
      query getReportData($code: String!) {
        reportData {
          report(code: $code) {
            code
            startTime
            endTime
            fights(killType: Encounters) {
              id
              name
              encounterID
              averageItemLevel
              bossPercentage
              completeRaid
              kill
              startTime
              endTime
            }
            masterData {
              actors(type: "Player") {
                id
                name
                icon
                type
                subType
              }
            }
          }
        }
      }
    `,
    {
      code,
    }
  );

  const actors = report.reportData.report.masterData.actors;
  // log.debug(actors);
  // const actorsMap = utils.arrToMap(
  //   actors,
  //   "id"
  // );
  // log.debug(actorsMap);

  log.debug(`Got ${actors.length} actors`);

  const fights = report.reportData.report.fights;
  // log.debug(fights);

  log.debug(`Got ${fights.length} fights`);

  if (!fights.length) {
    return;
  }

  const startTime = fights[0].startTime;
  const endTime = fights[fights.length - 1].endTime;
  // log.debug(startTime, endTime);

  const buffs = await gc.request(
    gql`
      query getBuffs(
        $code: String!
        $startTime: Float!
        $endTime: Float! # $abilityID: Float!
      ) {
        reportData {
          report(code: $code) {
            ony: table(
              startTime: $startTime
              endTime: $endTime
              dataType: Buffs
              abilityID: 22888
            )
            zg: table(
              startTime: $startTime
              endTime: $endTime
              dataType: Buffs
              abilityID: 24425
            )
            rend: table(
              startTime: $startTime
              endTime: $endTime
              dataType: Buffs
              abilityID: 16609
            )
            fengus: table(
              startTime: $startTime
              endTime: $endTime
              dataType: Buffs
              abilityID: 22817
            )
            moxie: table(
              startTime: $startTime
              endTime: $endTime
              dataType: Buffs
              abilityID: 22818
            )
            savvy: table(
              startTime: $startTime
              endTime: $endTime
              dataType: Buffs
              abilityID: 22820
            )
            sf: table(
              startTime: $startTime
              endTime: $endTime
              dataType: Buffs
              abilityID: 15366
            )
            sayge: table(
              startTime: $startTime
              endTime: $endTime
              dataType: Buffs
              abilityID: 23768
            )

            giants: table(
              startTime: $startTime
              endTime: $endTime
              dataType: Buffs
              abilityID: 11405
            )
            mongoose: table(
              startTime: $startTime
              endTime: $endTime
              dataType: Buffs
              abilityID: 17538
            )

            firepower: table(
              startTime: $startTime
              endTime: $endTime
              dataType: Buffs
              abilityID: 26276
            )
            shadow: table(
              startTime: $startTime
              endTime: $endTime
              dataType: Buffs
              abilityID: 11474
            )
            garcane: table(
              startTime: $startTime
              endTime: $endTime
              dataType: Buffs
              abilityID: 17539
            )
            supreme: table(
              startTime: $startTime
              endTime: $endTime
              dataType: Buffs
              abilityID: 17628
            )
            arcane: table(
              startTime: $startTime
              endTime: $endTime
              dataType: Buffs
              abilityID: 11390
            )

            stoneshield: table(
              startTime: $startTime
              endTime: $endTime
              dataType: Buffs
              abilityID: 17540
            )
            naturep: table(
              startTime: $startTime
              endTime: $endTime
              dataType: Buffs
              abilityID: 7254
            )
            gnaturep: table(
              startTime: $startTime
              endTime: $endTime
              dataType: Buffs
              abilityID: 17546
            )
            # gfirep: table(
            #   startTime: $startTime
            #   endTime: $endTime
            #   dataType: Buffs
            #   abilityID: 17543
            # )
            shadowp: table(
              startTime: $startTime
              endTime: $endTime
              dataType: Buffs
              abilityID: 7242
            )
            gshadowp: table(
              startTime: $startTime
              endTime: $endTime
              dataType: Buffs
              abilityID: 17548
            )
            frostp: table(
              startTime: $startTime
              endTime: $endTime
              dataType: Buffs
              abilityID: 7239
            )
            gfrostp: table(
              startTime: $startTime
              endTime: $endTime
              dataType: Buffs
              abilityID: 17544
            )

            spzanza: table(
              startTime: $startTime
              endTime: $endTime
              dataType: Buffs
              abilityID: 24382
            )
            swzanza: table(
              startTime: $startTime
              endTime: $endTime
              dataType: Buffs
              abilityID: 24383
            )
          }
        }
      }
    `,
    {
      code,
      startTime,
      endTime,
      // abilityId: 24425,
    }
  );

  const buffTypes = buffs.reportData.report;
  // log.debug(buffTypes);

  // for (let buffType in buffTypes) {
  //   const auras = buffTypes[buffType].data.auras;
  //   log.debug(buffType, auras);
  // }

  const buffsByActors = [];
  for (let a of actors) {
    const buffsByActor = [];
    for (let f of fights) {
      const buffsByFight = [];
      for (let buffType in buffTypes) {
        const auras = buffTypes[buffType].data.auras.find((e) => e.id == a.id);
        if (!auras) {
          continue;
        }

        let count = 0;
        for (let band of auras.bands) {
          if (band.startTime >= f.startTime && band.endTime <= f.endTime) {
            ++count;
          }
        }

        if (count > 0) {
          buffsByFight.push({ b: buffType, c: count });
        }
      }

      buffsByActor.push(buffsByFight);
    }

    buffsByActors.push(buffsByActor);
  }

  return { fights, actors, buffsByActors };
}

export default { validateCode, getBuffsAndConsummables };
