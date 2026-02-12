import { type Response } from 'express';

export const getProfile = async(req: any, res: Response) => {
  try {
    const { userId, userType } = req.user;

    res.json({
      status: "ok",
      message: "Protected data retrived successfully",
      data:{
        account_id: userId,
        role: userType,
        server_time: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({status: "error", message: "Failed to fetch profile"});
  }
}