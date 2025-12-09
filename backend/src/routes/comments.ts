import express from 'express';
import { getComments, addComment, deleteComment } from '../controllers/commentController';
import { protect } from '../middleware/auth';

const router = express.Router();

// Comments are usually accessed via cardId, but for deletion we might use ID directly
// Requirements: POST /api/cards/:cardId/comments
// We will handle that in a separate route file or here with mergeParams if we were nesting.
// But since we are not nesting in server.ts, we can't easily do /api/cards/:cardId/comments unless we mount it there.
// Let's create a route that handles /api/cards/:cardId/comments

// Actually, let's just make a generic comments route for now and maybe a specific one for cards.
// Or better, let's follow the requirement: POST /api/cards/:cardId/comments
// This implies we should add this to cardRoutes? Or make a new route file that handles this path.

// Let's add it to cardRoutes for simplicity as it is related to cards.
// Wait, I already created cardRoutes. I should add it there.

// But wait, I am creating `src/routes/comments.ts` now.
// Maybe I can just expose /api/comments for deletion and /api/cards/:cardId/comments in cardRoutes?

// Let's modify cardRoutes to include comments.
// And use this file for direct comment operations if any.

// Actually, let's just put the comment logic in `cardRoutes` for the POST, and maybe `commentRoutes` for DELETE.
// Or just put everything in `commentRoutes` and mount it at `/api`.

// Let's try to stick to the plan.
// I will mount this at `/api/comments` for DELETE.
// And I will add the POST to `cardRoutes` or here.

// If I mount this at `/api/cards`, I can do `router.route('/:cardId/comments').post(...)`
// That seems cleaner.

// So I will NOT use this file for the POST route if I mount it at `/api/comments`.
// I will mount it at `/api/cards` in server.ts? No, `cardRoutes` is already mounted at `/api/cards`.
// So I should add the comment route to `cardRoutes`.

// But I am writing `src/routes/comments.ts` now.
// Let's make this file handle `/api/comments` (e.g. delete)
// AND maybe I can import this router in `cardRoutes`? No that's messy.

// I will add `getComments` and `addComment` to `cardRoutes`.
// And `deleteComment` to `commentRoutes`.

// Let's just put everything in `cardRoutes` for now?
// No, `deleteComment` is `/api/comments/:id` usually?
// Requirements don't specify delete comment endpoint, but it's good to have.

// Let's just add the comment routes to `cardRoutes.ts` for now to match the requirement `POST /api/cards/:cardId/comments`.
// And I will delete this file creation if I can, or just use it for something else.
// Actually I can just use `cardRoutes.ts` for everything related to cards including comments.

// I will write `src/routes/comments.ts` to handle `DELETE /api/comments/:id` if I want to support that.
// But the requirement only says `POST`.

// Let's just add the comment routes to `cardRoutes.ts` and skip `src/routes/comments.ts` for now to avoid confusion?
// No, I already started writing `commentController`.

// I will add `POST /api/cards/:cardId/comments` to `cardRoutes.ts`.
// And I will add `DELETE /api/comments/:id` to `commentRoutes.ts` and mount it at `/api/comments`.

router.route('/:id').delete(protect, deleteComment);

export default router;
