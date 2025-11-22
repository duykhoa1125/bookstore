import jwt from "jsonwebtoken";
import { ENV} from "../config/env";

export interface JwtPayload {
    id: string;
    email: string;
    role: string;
}

export class JwtUtil {
  static sign(payload: JwtPayload): string {
    const options: jwt.SignOptions = {
      expiresIn: ENV.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    };

    // cast payload and secret to jwt types to satisfy overloads
    return jwt.sign(
      payload as jwt.JwtPayload,
      ENV.JWT_SECRET as jwt.Secret,
      options
    );
  }

  static verify(token: string): JwtPayload {
    return jwt.verify(token, ENV.JWT_SECRET as jwt.Secret) as JwtPayload;
  }
}