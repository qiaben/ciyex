import KJUR from 'jsrsasign';
import { ZOOM } from '../../../../constants/ZoomConstants';
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const iat = Math.round(new Date().getTime() - 30000) / 1000
    const exp = iat + 60 * 60 * 2

    const header = { alg: 'HS256', typ: 'JWT' };

    const payload = {
        version: 1,
        app_key: ZOOM.VIDEOSDK.KEY,
        password:req.body.password,
        tpc: req.body.topic,
        role_type: parseInt(req.body.role_type),
        session_key : req.body.topic,
        iat: iat,
        exp: exp
    }

    const sHeader = JSON.stringify(header);
    const sPayload = JSON.stringify(payload); 

    const signature = KJUR.KJUR.jws.JWS.sign('HS256', sHeader, sPayload, ZOOM.VIDEOSDK.SECRET);

    return res.json({
        sessionToken: signature
    })
}
