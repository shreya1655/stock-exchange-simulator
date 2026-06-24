import socketio
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from order_book import OrderBook
from portfolio_manager import PortfolioManager


sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
)

fastapi_app = FastAPI()

fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

order_book = OrderBook()
portfolio_manager = PortfolioManager()


@sio.event
async def connect(sid, environ):
    print("Socket connected:", sid)


@sio.event
async def disconnect(sid):
    print("Socket disconnected:", sid)


@fastapi_app.get("/")
async def root():
    return {"message": "Python stock exchange backend running"}


@fastapi_app.post("/orders/place")
async def place_order(request: Request):
    data = await request.json()

    symbol = data.get("symbol")
    side = data.get("side")
    price = float(data.get("price"))
    quantity = int(data.get("quantity"))
    user_id = data.get("userId")
    email = data.get("email", "")

    if not all([symbol, side, price, quantity, user_id]):
        raise HTTPException(status_code=400, detail="Missing order fields")

    portfolio_manager.create_user(user_id, email)

    validation = portfolio_manager.validate_order(
        user_id,
        symbol,
        side,
        price,
        quantity,
    )

    if not validation["valid"]:
        raise HTTPException(status_code=400, detail=validation["message"])

    trades = order_book.add_order({
        "symbol": symbol,
        "side": side,
        "price": price,
        "quantity": quantity,
        "userId": user_id,
        "email": email,
    })

    for trade in trades:
        portfolio_manager.process_trade(
            trade["buyerId"],
            trade["sellerId"],
            trade["symbol"],
            trade["price"],
            trade["quantity"],
        )

    await sio.emit("orderbook_update", order_book.get_all_books())
    await sio.emit("trade_update", trades)
    await sio.emit("leaderboard_update", portfolio_manager.get_leaderboard(order_book))

    return {"success": True}


@fastapi_app.get("/orders/books")
async def get_books():
    return order_book.get_all_books()


@fastapi_app.get("/orders/portfolio/{user_id}")
async def get_portfolio(user_id: str, email: str = ""):
    portfolio = portfolio_manager.get_portfolio_value(user_id, order_book)

    if not portfolio:
        portfolio_manager.create_user(user_id, email)
        portfolio = portfolio_manager.get_portfolio_value(user_id, order_book)

    return portfolio


@fastapi_app.delete("/orders/cancel/{order_id}")
async def cancel_order(order_id: str, request: Request):
    data = await request.json()
    user_id = data.get("userId")

    if not user_id:
        raise HTTPException(status_code=400, detail="userId is required")

    result = order_book.cancel_order(order_id, user_id)

    if not result["success"]:
        raise HTTPException(status_code=403, detail=result["message"])

    await sio.emit("orderbook_update", order_book.get_all_books())

    return result


app = socketio.ASGIApp(sio, fastapi_app)