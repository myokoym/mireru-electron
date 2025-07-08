# Python シンタックスハイライトのテスト
import asyncio
from typing import List, Dict, Optional
from dataclasses import dataclass

@dataclass
class Product:
    """商品データクラス"""
    id: int
    name: str
    price: float
    stock: int = 0

class ShoppingCart:
    """ショッピングカートクラス"""
    
    def __init__(self):
        self.items: Dict[int, Product] = {}
        self.quantities: Dict[int, int] = {}
    
    def add_item(self, product: Product, quantity: int = 1) -> None:
        """カートに商品を追加"""
        if product.id in self.items:
            self.quantities[product.id] += quantity
        else:
            self.items[product.id] = product
            self.quantities[product.id] = quantity
    
    def calculate_total(self) -> float:
        """合計金額を計算"""
        total = 0.0
        for product_id, quantity in self.quantities.items():
            product = self.items[product_id]
            total += product.price * quantity
        return total
    
    @property
    def item_count(self) -> int:
        """アイテム数を取得"""
        return sum(self.quantities.values())

# デコレータの例
def retry(max_attempts: int = 3):
    def decorator(func):
        async def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return await func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        raise
                    await asyncio.sleep(1)
        return wrapper
    return decorator

# 非同期処理の例
@retry(max_attempts=5)
async def fetch_products() -> List[Product]:
    """商品リストを取得"""
    # 実際のAPIコールをシミュレート
    await asyncio.sleep(0.1)
    return [
        Product(1, "ノートパソコン", 98000.0, 5),
        Product(2, "マウス", 2980.0, 50),
        Product(3, "キーボード", 5800.0, 30),
    ]

# リスト内包表記とジェネレータ
def fibonacci_generator(n: int):
    """フィボナッチ数列のジェネレータ"""
    a, b = 0, 1
    for _ in range(n):
        yield a
        a, b = b, a + b

# 条件分岐と例外処理
def validate_email(email: str) -> bool:
    """メールアドレスの検証"""
    import re
    
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    
    try:
        if not re.match(pattern, email):
            raise ValueError(f"Invalid email format: {email}")
        return True
    except ValueError as e:
        print(f"Validation error: {e}")
        return False

if __name__ == "__main__":
    # メイン処理
    cart = ShoppingCart()
    print(f"Total items: {cart.item_count}")
