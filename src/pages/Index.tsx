import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
}

interface Order {
  id: string;
  productId: number;
  productName: string;
  seller: string;
  buyer: string;
  price: number;
  date: string;
}

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState<Product[]>([
    { id: 1, name: 'Товар 1', price: 1000, description: 'Описание товара 1' },
    { id: 2, name: 'Товар 2', price: 2500, description: 'Описание товара 2' },
  ]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isOrderDialogOpen, setIsOrderDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [searchReceipt, setSearchReceipt] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<Order | null>(null);
  const { toast } = useToast();

  const [newProduct, setNewProduct] = useState({ name: '', price: 0, description: '' });
  const [newOrder, setNewOrder] = useState({ productId: 0, seller: '', buyer: '' });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login === 'VirtNumber' && password === '0000') {
      setIsLoggedIn(true);
      toast({ title: 'Добро пожаловать!', description: 'Вы успешно вошли в систему' });
    } else {
      toast({ title: 'Ошибка', description: 'Неверный логин или пароль', variant: 'destructive' });
    }
  };

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.price > 0) {
      const id = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
      setProducts([...products, { ...newProduct, id }]);
      setNewProduct({ name: '', price: 0, description: '' });
      setIsProductDialogOpen(false);
      toast({ title: 'Товар добавлен', description: 'Новый товар успешно добавлен в систему' });
    }
  };

  const handleEditProduct = () => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? editingProduct : p));
      setEditingProduct(null);
      setIsProductDialogOpen(false);
      toast({ title: 'Товар обновлен', description: 'Изменения сохранены' });
    }
  };

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
    toast({ title: 'Товар удален', description: 'Товар удален из системы' });
  };

  const handleCreateOrder = () => {
    if (newOrder.productId && newOrder.seller && newOrder.buyer) {
      const product = products.find(p => p.id === newOrder.productId);
      if (product) {
        const orderNumber = `MTV0${orders.length + 1}`;
        const order: Order = {
          id: orderNumber,
          productId: product.id,
          productName: product.name,
          seller: newOrder.seller,
          buyer: newOrder.buyer,
          price: product.price,
          date: new Date().toLocaleString('ru-RU'),
        };
        setOrders([...orders, order]);
        setSelectedReceipt(order);
        setIsOrderDialogOpen(false);
        setIsReceiptDialogOpen(true);
        setNewOrder({ productId: 0, seller: '', buyer: '' });
        toast({ title: 'Заказ создан', description: `Номер заказа: ${orderNumber}` });
      }
    }
  };

  const handleSearchReceipt = () => {
    const found = orders.find(o => o.id === searchReceipt);
    if (found) {
      setSelectedReceipt(found);
      setIsReceiptDialogOpen(true);
    } else {
      toast({ title: 'Чек не найден', description: 'Заказ с таким номером не существует', variant: 'destructive' });
    }
  };

  const handleDeleteReceipt = (id: string) => {
    setOrders(orders.filter(o => o.id !== id));
    toast({ title: 'Чек удален', description: 'Заказ удален из системы' });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-4">
              <Icon name="ShoppingCart" size={48} className="text-primary" />
            </div>
            <CardTitle className="text-2xl text-center font-bold">Учёт товаров</CardTitle>
            <p className="text-center text-muted-foreground">Войдите в систему для продолжения</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login">Логин</Label>
                <Input
                  id="login"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  placeholder="VirtNumber"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••"
                />
              </div>
              <Button type="submit" className="w-full">
                Войти
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="ShoppingCart" size={32} className="text-primary" />
            <h1 className="text-2xl font-bold">Учёт товаров</h1>
          </div>
          <Button variant="outline" onClick={() => setIsLoggedIn(false)}>
            <Icon name="LogOut" size={18} className="mr-2" />
            Выйти
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <Icon name="Package" size={18} />
              Товары
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Icon name="ShoppingBag" size={18} />
              Новый заказ
            </TabsTrigger>
            <TabsTrigger value="receipts" className="flex items-center gap-2">
              <Icon name="Receipt" size={18} />
              Чеки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Список товаров</h2>
              <Dialog open={isProductDialogOpen && !editingProduct} onOpenChange={setIsProductDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingProduct(null)}>
                    <Icon name="Plus" size={18} className="mr-2" />
                    Добавить товар
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Новый товар</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Название</Label>
                      <Input
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        placeholder="Название товара"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Стоимость</Label>
                      <Input
                        type="number"
                        value={newProduct.price || ''}
                        onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Описание</Label>
                      <Textarea
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                        placeholder="Описание товара"
                      />
                    </div>
                    <Button onClick={handleAddProduct} className="w-full">Добавить</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{product.name}</span>
                      <span className="text-primary font-bold">{product.price} ₽</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{product.description}</p>
                    <div className="flex gap-2">
                      <Dialog open={isProductDialogOpen && editingProduct?.id === product.id} onOpenChange={(open) => {
                        setIsProductDialogOpen(open);
                        if (!open) setEditingProduct(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setEditingProduct(product)} className="flex-1">
                            <Icon name="Pencil" size={14} className="mr-1" />
                            Редактировать
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Редактирование товара</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label>Название</Label>
                              <Input
                                value={editingProduct?.name || ''}
                                onChange={(e) => setEditingProduct(editingProduct ? { ...editingProduct, name: e.target.value } : null)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Стоимость</Label>
                              <Input
                                type="number"
                                value={editingProduct?.price || ''}
                                onChange={(e) => setEditingProduct(editingProduct ? { ...editingProduct, price: Number(e.target.value) } : null)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Описание</Label>
                              <Textarea
                                value={editingProduct?.description || ''}
                                onChange={(e) => setEditingProduct(editingProduct ? { ...editingProduct, description: e.target.value } : null)}
                              />
                            </div>
                            <Button onClick={handleEditProduct} className="w-full">Сохранить</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteProduct(product.id)}>
                        <Icon name="Trash2" size={14} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card className="max-w-2xl mx-auto shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="ShoppingBag" size={24} />
                  Создание нового заказа
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Товар</Label>
                  <Select value={String(newOrder.productId || '')} onValueChange={(value) => setNewOrder({ ...newOrder, productId: Number(value) })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите товар" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={String(product.id)}>
                          {product.name} - {product.price} ₽
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Кто принимал</Label>
                  <Input
                    value={newOrder.seller}
                    onChange={(e) => setNewOrder({ ...newOrder, seller: e.target.value })}
                    placeholder="Имя продавца"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Покупатель</Label>
                  <Input
                    value={newOrder.buyer}
                    onChange={(e) => setNewOrder({ ...newOrder, buyer: e.target.value })}
                    placeholder="Имя покупателя"
                  />
                </div>
                <Button onClick={handleCreateOrder} className="w-full" size="lg">
                  <Icon name="Plus" size={18} className="mr-2" />
                  Создать заказ
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="receipts" className="space-y-4">
            <div className="max-w-2xl mx-auto space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Поиск чека</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      value={searchReceipt}
                      onChange={(e) => setSearchReceipt(e.target.value)}
                      placeholder="Введите номер заказа (например, MTV01)"
                    />
                    <Button onClick={handleSearchReceipt}>
                      <Icon name="Search" size={18} />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Все чеки</h3>
                {orders.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      <Icon name="Receipt" size={48} className="mx-auto mb-2 opacity-30" />
                      <p>Пока нет заказов</p>
                    </CardContent>
                  </Card>
                ) : (
                  orders.map((order) => (
                    <Card key={order.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-lg">{order.id}</div>
                            <div className="text-sm text-muted-foreground">{order.productName}</div>
                            <div className="text-sm">{order.date}</div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedReceipt(order);
                                setIsReceiptDialogOpen(true);
                              }}
                            >
                              <Icon name="Eye" size={14} className="mr-1" />
                              Просмотр
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteReceipt(order.id)}>
                              <Icon name="Trash2" size={14} />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={isReceiptDialogOpen} onOpenChange={setIsReceiptDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Receipt" size={24} />
              Чек заказа
            </DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <div className="space-y-4 border-2 border-dashed border-gray-300 rounded-lg p-6 bg-white">
              <div className="text-center border-b pb-3">
                <h3 className="font-bold text-2xl">{selectedReceipt.id}</h3>
                <p className="text-sm text-muted-foreground">{selectedReceipt.date}</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Товар:</span>
                  <span className="font-medium">{selectedReceipt.productName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Продавец:</span>
                  <span className="font-medium">{selectedReceipt.seller}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Покупатель:</span>
                  <span className="font-medium">{selectedReceipt.buyer}</span>
                </div>
                <div className="flex justify-between border-t pt-2 text-lg">
                  <span className="font-bold">Итого:</span>
                  <span className="font-bold text-primary">{selectedReceipt.price} ₽</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
