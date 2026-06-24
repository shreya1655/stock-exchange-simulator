class PortfolioManager:
    def __init__(self):
        self.portfolios = {}

    def create_user(self, user_id: str, email: str = ""):
        if user_id not in self.portfolios:
            self.portfolios[user_id] = {
                "userId": user_id,
                "email": email,
                "cash": 100000,
                "holdings": {
                    "AAPL": {"shares": 100, "avgBuyPrice": 100},
                    "GOOGL": {"shares": 100, "avgBuyPrice": 100},
                    "TSLA": {"shares": 100, "avgBuyPrice": 100},
                    "MSFT": {"shares": 100, "avgBuyPrice": 100},
                    "AMZN": {"shares": 100, "avgBuyPrice": 100},
                },
            }

        return self.portfolios[user_id]

    def get_portfolio(self, user_id: str):
        return self.portfolios.get(user_id)

    def validate_order(self, user_id: str, symbol: str, side: str, price: float, quantity: int):
        portfolio = self.portfolios.get(user_id)

        if not portfolio:
            return {"valid": False, "message": "Portfolio not found"}

        holding = portfolio["holdings"].get(symbol)
        order_value = price * quantity

        if side == "BUY":
            if portfolio["cash"] < order_value:
                return {"valid": False, "message": "Insufficient cash balance"}

        if side == "SELL":
            if not holding or holding["shares"] < quantity:
                return {"valid": False, "message": "Insufficient shares"}

        return {"valid": True}

    def get_market_price(self, symbol: str, order_book):
        book = order_book.get_order_book(symbol)

        if book["sellOrders"]:
            return book["sellOrders"][0]["price"]

        if book["buyOrders"]:
            return book["buyOrders"][0]["price"]

        return 100

    def get_portfolio_value(self, user_id: str, order_book):
        portfolio = self.portfolios.get(user_id)

        if not portfolio:
            return None

        holdings_value = 0

        for symbol, holding in portfolio["holdings"].items():
            market_price = self.get_market_price(symbol, order_book)
            holdings_value += holding["shares"] * market_price

        total_value = portfolio["cash"] + holdings_value
        initial_value = 100000 + (100 * 100 * 5)
        pnl = total_value - initial_value

        return {
            **portfolio,
            "holdingsValue": holdings_value,
            "totalValue": total_value,
            "pnl": pnl,
        }

    def process_trade(self, buyer_id: str, seller_id: str, symbol: str, price: float, quantity: int):
        buyer = self.portfolios.get(buyer_id)
        seller = self.portfolios.get(seller_id)

        if not buyer or not seller:
            return

        cost = price * quantity

        buyer["cash"] -= cost

        buyer_holding = buyer["holdings"][symbol]
        old_shares = buyer_holding["shares"]
        old_avg = buyer_holding["avgBuyPrice"]

        total_cost = old_avg * old_shares + cost
        buyer_holding["shares"] += quantity
        buyer_holding["avgBuyPrice"] = total_cost / buyer_holding["shares"]

        seller["cash"] += cost

        seller_holding = seller["holdings"][symbol]
        seller_holding["shares"] -= quantity

    def get_leaderboard(self, order_book):
        result = []

        for user_id, user in self.portfolios.items():
            holdings_value = 0

            for symbol, holding in user["holdings"].items():
                market_price = self.get_market_price(symbol, order_book)
                holdings_value += holding["shares"] * market_price

            total_value = user["cash"] + holdings_value

            result.append({
                "userId": user_id,
                "email": user["email"],
                "totalValue": total_value,
            })

        result.sort(key=lambda x: x["totalValue"], reverse=True)
        return result