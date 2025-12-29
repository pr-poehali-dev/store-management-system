import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для управления заказами: создание, получение списка, поиск, удаление'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            query_params = event.get('queryStringParameters', {})
            order_number = query_params.get('orderNumber')
            
            if order_number:
                cursor.execute('SELECT * FROM orders WHERE order_number = %s', (order_number,))
                order = cursor.fetchone()
                if order:
                    return {
                        'statusCode': 200,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps(dict(order), default=str),
                        'isBase64Encoded': False
                    }
                else:
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Order not found'}),
                        'isBase64Encoded': False
                    }
            else:
                cursor.execute('SELECT * FROM orders ORDER BY created_at DESC')
                orders = cursor.fetchall()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps([dict(o) for o in orders], default=str),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            
            cursor.execute('SELECT COUNT(*) as count FROM orders')
            count_result = cursor.fetchone()
            order_count = count_result['count'] + 1
            order_number = f"MTV0{order_count}"
            
            cursor.execute('SELECT * FROM products WHERE id = %s', (body['productId'],))
            product = cursor.fetchone()
            
            cursor.execute(
                '''INSERT INTO orders 
                (order_number, product_id, product_name, product_description, price, seller, buyer, phone, additional_info) 
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING *''',
                (
                    order_number,
                    body['productId'],
                    product['name'],
                    product['description'],
                    product['price'],
                    body['seller'],
                    body['buyer'],
                    body.get('phone', ''),
                    body.get('additionalInfo', '')
                )
            )
            order = cursor.fetchone()
            conn.commit()
            
            return {
                'statusCode': 201,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(dict(order), default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            query_params = event.get('queryStringParameters', {})
            order_number = query_params.get('orderNumber')
            
            cursor.execute('DELETE FROM orders WHERE order_number = %s', (order_number,))
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        cursor.close()
        conn.close()
