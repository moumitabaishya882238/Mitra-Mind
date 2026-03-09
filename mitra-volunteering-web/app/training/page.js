export default function TrainingPage() {
  return (
    <section className="card">
      <h2>Listener Training Module</h2>
      <p>Required learning topics before listener activation.</p>

      <div className="grid">
        <div className="card"><h3>Active Listening</h3><p>Reflect feelings, avoid interruption, ask open-ended questions.</p></div>
        <div className="card"><h3>Empathy in Conversations</h3><p>Validate emotions and avoid dismissive language.</p></div>
        <div className="card"><h3>Avoid Harmful Advice</h3><p>Do not diagnose, prescribe, or force decisions.</p></div>
        <div className="card"><h3>Crisis Recognition</h3><p>Watch for suicidal ideation and severe distress cues.</p></div>
        <div className="card"><h3>Escalation</h3><p>Route high-risk situations to helplines/professionals immediately.</p></div>
      </div>

      <div className="card">
        <h3>Quiz</h3>
        <p>What should you do if a user expresses suicidal thoughts?</p>
        <p><strong>Correct answer:</strong> Escalate to professional support.</p>
        <p>This answer is mandatory for training completion in the application flow.</p>
      </div>
    </section>
  );
}
