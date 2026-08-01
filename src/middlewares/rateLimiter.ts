import { ipKeyGenerator, rateLimit } from 'express-rate-limit'
import { ENV } from "../config/env";

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  limit: 100,                 // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false,       // Disable the `X-RateLimit-*` headers.
  ipv6Subnet: 56,             // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive

  /**
   * Express request handler that sends back a response when a client is rate-limited.
   * By default, sends back the statusCode and message set via the options, similar to this:
   */
  handler: (req, res, next, options) =>
    res.status(options.statusCode).send(options.message),

  /**
   * Method to retrieve custom identifiers for clients, such as their IP address, username, or API Key.
   * Should be a (sync/async) function that accepts the Express request and response objects and then returns a string.
   */
  keyGenerator: (req, res) => ipKeyGenerator(<string>req.ip),


  /**
   * When using a custom keyGenerator that uses the user’s IP for rate-limiting (even as a fallback), return the result of this method rather than the IP address itself.
   */
  // keyGenerator: (req, res) => {
  //   use userID for authenticated users
    // if (userIsAuthenticate(req)) {
    //   return req.userId
    // }
    // fall back to IP address for unauthenticated users
    // use ipKeyGenerator to apply a /56 subnet to IPv6 users (IPv4 returned unchanged)
    // return ipKeyGenerator(<string>req.ip, 56)
  // },
})

export const adminLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,   // 30 minutes
  limit: 1,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (token && token === ENV.ADMIN_API_KEY) {
      return 'admin'
    }

    return ipKeyGenerator(<string>req.ip, 56)
  },
})


export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,    // 15 minutes
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req, res) => ipKeyGenerator(<string>req.ip, 56),
})
