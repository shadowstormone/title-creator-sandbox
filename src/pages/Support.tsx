import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Support = () => {
  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white text-center mb-8">
          Поддержать проект
        </h1>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Единоразовый донат</CardTitle>
              <CardDescription className="text-gray-400">
                Поддержите проект любой суммой
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="default">
                Поддержать
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Подписка</CardTitle>
              <CardDescription className="text-gray-400">
                Ежемесячная поддержка проекта
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" variant="default">
                Оформить подписку
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Почему стоит поддержать нас?
          </h2>
          <div className="text-gray-300 space-y-4">
            <p>
              Ваша поддержка помогает нам развивать проект и делать его лучше.
            </p>
            <p>
              Мы работаем над новыми функциями и улучшением качества контента.
            </p>
            <p>
              Все средства идут на развитие проекта и оплату серверов.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;