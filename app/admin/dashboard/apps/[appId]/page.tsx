export default function AppDashboardPage({ params }: { params: { appId: string } }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">Manage App {params.appId}</h1>
      <p className="text-muted-foreground">Tree + Editor placeholders will appear here.</p>
    </div>
  );
}
