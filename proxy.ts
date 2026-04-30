import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtected = createRouteMatcher(['/ratings(.*)', '/watchlist(.*)', '/favorites(.*)', '/recommendations(.*)', '/admin(.*)', '/submit(.*)'])

export default clerkMiddleware(async (auth, req) => {
    if (isProtected(req)) {
        await auth.protect()
    }
})

export const config = {
    matcher: [
        // Exclude /monitoring (Sentry tunnel route) so events bypass middleware.
        '/((?!_next|monitoring|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
}
