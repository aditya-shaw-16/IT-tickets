export function calculateDeadline(priority) {
  const now = new Date();
  const deadline = new Date(now);

  if (priority === "P0") {
    deadline.setHours(23, 59, 59, 999); // Today EOD
  } else if (priority === "P1") {
    deadline.setDate(deadline.getDate() + 1);
    deadline.setHours(23, 59, 59, 999); // Next day EOD
  } else {
    deadline.setDate(deadline.getDate() + 2);
    deadline.setHours(23, 59, 59, 999); // Next to next day EOD (P2 default)
  }

  return deadline;
}
