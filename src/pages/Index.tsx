import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MainLayout } from "@/components/MainLayout";
import { ExpenseCard } from "@/components/ExpenseCard";
import { AddExpenseButton } from "@/components/AddExpenseButton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GroupsList } from "@/components/GroupsList";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CreateExpenseForm } from "@/components/CreateExpenseForm";

const Index = () => {
  const { toast } = useToast();
  const [showAllGroups, setShowAllGroups] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: session } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
    },
  });

  const { data: profile } = useQuery({
    queryKey: ['profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) throw new Error('No session');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const { data: recentExpenses } = useQuery({
    queryKey: ['recent-expenses'],
    queryFn: async () => {
      if (!session) throw new Error('No session');

      const { data: groupMemberships } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', session.user.id);

      if (!groupMemberships) return [];
      
      const groupIds = groupMemberships.map(gm => gm.group_id);

      const { data, error } = await supabase
        .from('expenses')
        .select(`
          id,
          title,
          amount,
          currency,
          expense_date,
          paid_by_user_id,
          paid_by_profile:profiles!expenses_paid_by_user_id_fkey1 (
            display_name
          ),
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

  const { data: groups } = useQuery({
    queryKey: ['groups', session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) throw new Error('No session');
      
      const { data, error } = await supabase
        .from('groups')
        .select(`
          id,
          title,
          description,
          default_currency,
          group_members!inner (
            user_id
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!session?.user?.id,
  });

  const handleAddExpense = () => {
    setIsExpenseDialogOpen(true);
  };

  const handleExpenseClick = (id: string) => {
    toast({
      title: "Coming soon!",
      description: "Expense details will be available soon.",
    });
  };

  const visibleGroups = showAllGroups ? groups : groups?.slice(0, 4);

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            {profile?.display_name ? `Hello, ${profile.display_name}` : "Hello!"}
          </h1>
          <h2 className="text-xl font-semibold text-neutral-900">Recent expenses</h2>
        </header>

        <div className="space-y-8">
          <div className="space-y-4">
            {recentExpenses?.map((expense) => (
              <ExpenseCard
                key={expense.id}
                title={expense.title}
                amount={expense.amount}
                currency={expense.currency}
                date={new Date(expense.expense_date)}
                paidBy={expense.paid_by_profile?.display_name || 'Unknown'}
                participants={expense.expense_participants.map(p => p.user_id)}
                onClick={() => handleExpenseClick(expense.id)}
              />
            ))}
          </div>

          {groups && groups.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Your Groups</h2>
              <GroupsList groups={visibleGroups || []} />
              {groups.length > 4 && (
                <Button
                  variant="ghost"
                  className="w-full mt-4"
                  onClick={() => setShowAllGroups(!showAllGroups)}
                >
                  {showAllGroups ? (
                    <>
                      Show less <ChevronUp className="ml-2 h-4 w-4" />
                    </>
                  ) : (
                    <>
                      Show more <ChevronDown className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          )}

          <AddExpenseButton onClick={() => setIsExpenseDialogOpen(true)} />
        </div>

        <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
          <DialogContent>
            <h2 className="text-lg font-semibold mb-4">Add Expense</h2>
            {session && (
              <CreateExpenseForm
                defaultCurrency="USD"
                groupMembers={[]}
                onSuccess={() => {
                  setIsExpenseDialogOpen(false);
                  queryClient.invalidateQueries({ queryKey: ['recent-expenses'] });
                }}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
};

export default Index;
