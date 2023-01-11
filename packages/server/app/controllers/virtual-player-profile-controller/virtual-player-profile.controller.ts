import { VirtualPlayerProfilesRequest } from '@app/classes/communication/request';
import { VirtualPlayerData, VirtualPlayerProfile } from '@app/classes/database/virtual-player-profile';
import { HttpException } from '@app/classes/http-exception/http-exception';
import { VirtualPlayerLevel } from '@app/classes/player/virtual-player-level';
import { INVALID_LEVEL, MISSING_PARAMETER } from '@app/constants/services-errors';
import VirtualPlayerProfileService from '@app/services/virtual-player-profile-service/virtual-player-profile.service';
import { Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class VirtualPlayerProfilesController {
    router: Router;

    constructor(private virtualPlayerProfileService: VirtualPlayerProfileService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();

        this.router.get('/virtualPlayerProfiles', async (req: VirtualPlayerProfilesRequest, res: Response, next) => {
            try {
                const virtualPlayerProfiles: VirtualPlayerProfile[] = await this.virtualPlayerProfileService.getAllVirtualPlayerProfiles();
                res.status(StatusCodes.OK).send({ virtualPlayerProfiles });
            } catch (exception) {
                next(exception);
            }
        });

        this.router.get('/virtualPlayerProfiles/:level', async (req: VirtualPlayerProfilesRequest, res: Response, next) => {
            try {
                const level: VirtualPlayerLevel = req.params.level as VirtualPlayerLevel;
                if (!Object.values(VirtualPlayerLevel).includes(level)) throw new HttpException(INVALID_LEVEL, StatusCodes.BAD_REQUEST);

                const virtualPlayerProfiles: VirtualPlayerProfile[] = await this.virtualPlayerProfileService.getVirtualPlayerProfilesFromLevel(level);
                res.status(StatusCodes.OK).send({ virtualPlayerProfiles });
            } catch (exception) {
                next(exception);
            }
        });

        this.router.post('/virtualPlayerProfiles', async (req: VirtualPlayerProfilesRequest, res: Response, next) => {
            try {
                const virtualPlayerData: VirtualPlayerData = req.body.virtualPlayerData;
                if (!virtualPlayerData) throw new HttpException(MISSING_PARAMETER, StatusCodes.BAD_REQUEST);

                await this.virtualPlayerProfileService.addVirtualPlayerProfile(virtualPlayerData);
                res.status(StatusCodes.CREATED).send();
            } catch (exception) {
                next(exception);
            }
        });

        this.router.patch('/virtualPlayerProfiles/:profileId', async (req: VirtualPlayerProfilesRequest, res: Response, next) => {
            try {
                const profileId: string = req.params.profileId;
                const newName: string = req.body.profileData.name;
                if (!newName) throw new HttpException(MISSING_PARAMETER, StatusCodes.BAD_REQUEST);
                await this.virtualPlayerProfileService.updateVirtualPlayerProfile(newName, profileId);
                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                next(exception);
            }
        });

        this.router.delete('/virtualPlayerProfiles/:profileId', async (req: VirtualPlayerProfilesRequest, res: Response, next) => {
            try {
                const profileId: string = req.params.profileId;
                await this.virtualPlayerProfileService.deleteVirtualPlayerProfile(profileId);
                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                next(exception);
            }
        });

        this.router.delete('/virtualPlayerProfiles', async (req: VirtualPlayerProfilesRequest, res: Response, next) => {
            try {
                await this.virtualPlayerProfileService.resetVirtualPlayerProfiles();
                res.status(StatusCodes.NO_CONTENT).send();
            } catch (exception) {
                next(exception);
            }
        });
    }
}
