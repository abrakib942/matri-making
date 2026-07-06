import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default async function DashboardPage() {
  // Auth check is handled by authenticated layout, no need to check here

  return (
    <div className="w-full">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Welcome to the admin panel.</p>
        </CardContent>
      </Card>
    </div>
  );
}
