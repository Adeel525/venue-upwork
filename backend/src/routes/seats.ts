import { Router, Request, Response } from 'express';
import { getAllSeatAssignments, getSeatAssignment } from '../data/mockSeatAssignments';

const router = Router();

// GET /seats/assignments - Get all seat assignments
router.get('/assignments', (_req: Request, res: Response) => {
  try {
    const assignments = getAllSeatAssignments();
    res.json(assignments);
  } catch (error) {
    console.error('Error fetching seat assignments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /seats/:seatId/assignment - Get assignment for a specific seat
router.get('/:seatId/assignment', (req: Request, res: Response) => {
  try {
    const { seatId } = req.params;
    const assignment = getSeatAssignment(seatId);

    if (!assignment) {
      res.status(404).json({ error: 'Seat assignment not found' });
      return;
    }

    res.json(assignment);
  } catch (error) {
    console.error('Error fetching seat assignment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { router as seatsRouter };

