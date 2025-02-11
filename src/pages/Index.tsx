
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/MainLayout";
import { ExpenseCard } from "@/components/ExpenseCard";
import { AddExpenseButton } from "@/components/AddExpenseButton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { toast } = useToast();

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      if (!session) throw new Error('No session');

      const { data, error } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', session.user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!session,
  });

  const { data: recentExpenses } = useQuery({
    queryKey: ['recent-expenses'],
    queryFn: async () => {
      if (!session) throw new Error('No session');

      // First get the user's group ids
      const { data: groupMemberships } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', session.user.id);

      if (!groupMemberships) return [];
      
      const groupIds = groupMemberships.map(gm => gm.group_id);

      // Then get expenses for those groups
      const { data, error } = await supabase
        .from('expenses')
        .select(`
          id,
          title,
          amount,
          expense_date,
          paid_by_user_id,
          group_id,
          groups!inner(title),
          expense_participants!inner(user_id)
        `)
        .in('group_id', groupIds)
        .order('created_at', { ascending: false })
        .limit(8);
      
      if (error) throw error;
      return data;
    },
    enabled: !!session,
  });

  const handleAddExpense = () => {
    toast({
      title: "Coming soon!",
      description: "Add expense functionality will be available soon.",
    });
  };

  const handleExpenseClick = (id: string) => {
    toast({
      title: "Coming soon!",
      description: "Expense details will be available soon.",
    });
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            Hello, {profile?.display_name}
          </h1>
          <p className="text-neutral-500">Here are your recent expenses</p>
        </header>

        <div className="space-y-4">
          {recentExpenses?.map((expense) => (
            <ExpenseCard
              key={expense.id}
              title={expense.title}
              amount={expense.amount}
              date={new Date(expense.expense_date)}
              paidBy={expense.paid_by_user_id}
              participants={expense.expense_participants.map(p => p.user_id)}
              onClick={() => handleExpenseClick(expense.id)}
            />
          ))}
        </div>

        <AddExpenseButton onClick={handleAddExpense} />
      </div>
    </MainLayout>
  );
};

export default Index;
