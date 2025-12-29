import { useState, useEffect } from 'react';
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
  price: number | string;
  description: string;
}

interface Order {
  order_number: string;
  product_id: number;
  product_name: string;
  product_description: string;
  price: number | string;
  seller: string;
  buyer: string;
  phone: string;
  additional_info: string;
  created_at: string;
}

const PRODUCTS_API = 'https://functions.poehali.dev/3429a1e7-2ca6-4139-86ea-817eec281696';
const ORDERS_API = 'https://functions.poehali.dev/0f034f86-1ea0-4fee-a3be-acf9acd368ba';

const Index = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);
  const [searchReceipt, setSearchReceipt] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<Order | null>(null);
  const [receiptText, setReceiptText] = useState('');
  const { toast } = useToast();

  const [newProduct, setNewProduct] = useState({ name: '', price: 0, description: '' });
  const [newOrder, setNewOrder] = useState({ 
    productId: 0, 
    seller: '', 
    buyer: '', 
    additionalInfo: '' 
  });

  const fetchProducts = async () => {
    try {
      const response = await fetch(PRODUCTS_API);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch(ORDERS_API);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchProducts();
      fetchOrders();
    }
  }, [isLoggedIn]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login === 'VirtNumber' && password === '0000') {
      setIsLoggedIn(true);
      toast({ title: 'Добро пожаловать!', description: 'Вы успешно вошли в систему' });
    } else {
      toast({ title: 'Ошибка', description: 'Неверный логин или пароль', variant: 'destructive' });
    }
  };

  const handleAddProduct = async () => {
    if (newProduct.name && newProduct.price > 0) {
      try {
        const response = await fetch(PRODUCTS_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newProduct)
        });
        await response.json();
        fetchProducts();
        setNewProduct({ name: '', price: 0, description: '' });
        setIsProductDialogOpen(false);
        toast({ title: 'Товар добавлен', description: 'Новый товар успешно добавлен в систему' });
      } catch (error) {
        toast({ title: 'Ошибка', description: 'Не удалось добавить товар', variant: 'destructive' });
      }
    }
  };

  const handleEditProduct = async () => {
    if (editingProduct) {
      try {
        await fetch(PRODUCTS_API, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingProduct)
        });
        fetchProducts();
        setEditingProduct(null);
        setIsProductDialogOpen(false);
        toast({ title: 'Товар обновлен', description: 'Изменения сохранены' });
      } catch (error) {
        toast({ title: 'Ошибка', description: 'Не удалось обновить товар', variant: 'destructive' });
      }
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await fetch(`${PRODUCTS_API}?id=${id}`, { method: 'DELETE' });
      fetchProducts();
      toast({ title: 'Товар удален', description: 'Товар удален из системы' });
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось удалить товар', variant: 'destructive' });
    }
  };

  const generateReceiptText = (order: Order) => {
    const price = typeof order.price === 'string' ? parseFloat(order.price) : order.price;
    let text = `━━━━━━━━━━━━━━━━━━━\n`;
    text += `          ЧЕК ЗАКАЗА\n`;
    text += `━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `📦 Заказ: ${order.order_number}\n`;
    text += `📅 Дата: ${new Date(order.created_at).toLocaleString('ru-RU')}\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━\n`;
    text += `ТОВАР:\n`;
    text += `${order.product_name}\n`;
    if (order.product_description) {
      text += `Описание: ${order.product_description}\n`;
    }
    text += `\n💰 Стоимость: ${price.toFixed(2)} ₽\n`;
    text += `━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `👤 Продавец: ${order.seller}\n`;
    text += `👥 Покупатель: ${order.buyer}\n`;
    if (order.additional_info) {
      text += `\n━━━━━━━━━━━━━━━━━━━\n`;
      text += `ДОПОЛНИТЕЛЬНО К ЗАКАЗУ:\n`;
      text += `${order.additional_info}\n`;
    }
    text += `\n━━━━━━━━━━━━━━━━━━━\n`;
    text += `    Спасибо за покупку!\n`;
    text += `━━━━━━━━━━━━━━━━━━━`;
    return text;
  };

  const handleCreateOrder = async () => {
    if (newOrder.productId && newOrder.seller && newOrder.buyer) {
      try {
        const response = await fetch(ORDERS_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOrder)
        });
        const order = await response.json();
        fetchOrders();
        setSelectedReceipt(order);
        setReceiptText(generateReceiptText(order));
        setIsReceiptDialogOpen(true);
        setNewOrder({ productId: 0, seller: '', buyer: '', additionalInfo: '' });
        toast({ title: 'Заказ создан', description: `Номер заказа: ${order.order_number}` });
      } catch (error) {
        toast({ title: 'Ошибка', description: 'Не удалось создать заказ', variant: 'destructive' });
      }
    }
  };

  const handleSearchReceipt = async () => {
    try {
      const response = await fetch(`${ORDERS_API}?orderNumber=${searchReceipt}`);
      if (response.ok) {
        const order = await response.json();
        setSelectedReceipt(order);
        setReceiptText(generateReceiptText(order));
        setIsReceiptDialogOpen(true);
      } else {
        toast({ title: 'Чек не найден', description: 'Заказ с таким номером не существует', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось найти чек', variant: 'destructive' });
    }
  };

  const handleDeleteReceipt = async (orderNumber: string) => {
    try {
      await fetch(`${ORDERS_API}?orderNumber=${orderNumber}`, { method: 'DELETE' });
      fetchOrders();
      toast({ title: 'Чек удален', description: 'Заказ удален из системы' });
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось удалить чек', variant: 'destructive' });
    }
  };

  const copyReceiptToClipboard = () => {
    navigator.clipboard.writeText(receiptText);
    toast({ title: 'Скопировано!', description: 'Чек скопирован в буфер обмена' });
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-slate-200">
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
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
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
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto bg-white border border-slate-200">
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
              {products.map((product) => {
                const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
                return (
                  <Card key={product.id} className="hover:shadow-md transition-shadow border-slate-200">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{product.name}</span>
                        <span className="text-primary font-bold">{price.toFixed(2)} ₽</span>
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
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card className="max-w-2xl mx-auto shadow-md border-slate-200">
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
                      {products.map((product) => {
                        const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;
                        return (
                          <SelectItem key={product.id} value={String(product.id)}>
                            {product.name} - {price.toFixed(2)} ₽
                          </SelectItem>
                        );
                      })}
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
                <div className="space-y-2">
                  <Label>Дополнительно к заказу (необязательно)</Label>
                  <Textarea
                    value={newOrder.additionalInfo}
                    onChange={(e) => setNewOrder({ ...newOrder, additionalInfo: e.target.value })}
                    placeholder="Номер телефона, пароль, комментарии"
                    rows={4}
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
              <Card className="border-slate-200">
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
                  <Card className="border-slate-200">
                    <CardContent className="py-8 text-center text-muted-foreground">
                      <Icon name="Receipt" size={48} className="mx-auto mb-2 opacity-30" />
                      <p>Пока нет заказов</p>
                    </CardContent>
                  </Card>
                ) : (
                  orders.map((order) => (
                    <Card key={order.order_number} className="hover:shadow-md transition-shadow border-slate-200">
                      <CardContent className="py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-bold text-lg">{order.order_number}</div>
                            <div className="text-sm text-muted-foreground">{order.product_name}</div>
                            <div className="text-sm">{new Date(order.created_at).toLocaleString('ru-RU')}</div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedReceipt(order);
                                setReceiptText(generateReceiptText(order));
                                setIsReceiptDialogOpen(true);
                              }}
                            >
                              <Icon name="Eye" size={14} className="mr-1" />
                              Просмотр
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteReceipt(order.order_number)}>
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
            <div className="space-y-4">
              <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
                <pre className="font-mono text-sm whitespace-pre-wrap">{receiptText}</pre>
              </div>
              <Button onClick={copyReceiptToClipboard} className="w-full" size="lg">
                <Icon name="Copy" size={18} className="mr-2" />
                Скопировать чек для отправки
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;