export interface PlanEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  source: 'user' | 'pse-deadline' | 'generated-task';
  priority: 'Low' | 'Medium' | 'High' | 'Mandatory';
  isConflict?: boolean;
  completed: boolean;
  weight: number; // Represents contribution to the weekly meter (0-100)
}
