from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from datetime import datetime
import io
import base64
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT

from database import get_db
from models import PurchaseRequest as PurchaseRequestModel, User
from auth import get_current_active_user

router = APIRouter(prefix="/pdf", tags=["pdf-export"])

@router.get("/receipt/{request_id}")
async def generate_receipt_pdf(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Générer le PDF du bon de réception signé"""
    
    # Récupérer la demande d'achat
    request = db.query(PurchaseRequestModel).filter(PurchaseRequestModel.id == request_id).first()
    if not request:
        raise HTTPException(status_code=404, detail="Demande d'achat non trouvée")
    
    if request.status != "received":
        raise HTTPException(status_code=400, detail="Cette demande n'a pas encore été reçue")
    
    # Créer le PDF en mémoire
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=18)
    
    # Styles
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        spaceAfter=30,
        alignment=TA_CENTER,
        textColor=colors.darkblue
    )
    
    header_style = ParagraphStyle(
        'Header',
        parent=styles['Heading2'],
        fontSize=14,
        spaceAfter=12,
        textColor=colors.darkblue
    )
    
    normal_style = ParagraphStyle(
        'Normal',
        parent=styles['Normal'],
        fontSize=10,
        spaceAfter=6
    )
    
    # Contenu du PDF
    story = []
    
    # En-tête
    story.append(Paragraph("BON DE RÉCEPTION", title_style))
    story.append(Spacer(1, 20))
    
    # Informations de la demande
    story.append(Paragraph("INFORMATIONS DE LA COMMANDE", header_style))
    
    request_data = [
        ["Numéro de demande:", request.request_number],
        ["Article demandé:", request.item_name],
        ["Description:", request.description or "N/A"],
        ["Quantité:", f"{request.quantity} {request.unit}"],
        ["Catégorie:", request.category],
        ["Service demandeur:", request.department],
        ["Demandé par:", request.requested_by],
        ["Date de demande:", request.requested_at.strftime("%d/%m/%Y à %H:%M")],
        ["Numéro de commande:", request.order_number or "N/A"],
        ["Fournisseur:", request.supplier.name if request.supplier else "N/A"]
    ]
    
    request_table = Table(request_data, colWidths=[2*inch, 4*inch])
    request_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('BACKGROUND', (0, 0), (0, -1), colors.lightblue),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.darkblue),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
    ]))
    
    story.append(request_table)
    story.append(Spacer(1, 20))
    
    # Informations de réception
    story.append(Paragraph("INFORMATIONS DE RÉCEPTION", header_style))
    
    reception_data = [
        ["Date de réception:", request.received_at.strftime("%d/%m/%Y à %H:%M")],
        ["Reçu par:", request.received_by],
        ["Notes de réception:", request.receipt_notes or "Aucune note"],
        ["Statut:", "REÇU"]
    ]
    
    reception_table = Table(reception_data, colWidths=[2*inch, 4*inch])
    reception_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.lightgreen),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('BACKGROUND', (0, 0), (0, -1), colors.green),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.white),
        ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
    ]))
    
    story.append(reception_table)
    story.append(Spacer(1, 20))
    
    # Signature
    if request.receipt_signature:
        story.append(Paragraph("SIGNATURE ÉLECTRONIQUE", header_style))
        story.append(Spacer(1, 10))
        
        try:
            # Décoder l'image de signature
            signature_data = base64.b64decode(request.receipt_signature.split(',')[1] if ',' in request.receipt_signature else request.receipt_signature)
            signature_img = Image(io.BytesIO(signature_data), width=4*inch, height=1.5*inch)
            story.append(signature_img)
        except Exception as e:
            story.append(Paragraph(f"Erreur lors du chargement de la signature: {str(e)}", normal_style))
    
    story.append(Spacer(1, 30))
    
    # Pied de page
    story.append(Paragraph(f"Document généré le {datetime.now().strftime('%d/%m/%Y à %H:%M')}", 
                         ParagraphStyle('Footer', parent=styles['Normal'], fontSize=8, alignment=TA_CENTER)))
    
    # Construire le PDF
    doc.build(story)
    
    # Retourner le fichier PDF
    buffer.seek(0)
    
    return FileResponse(
        io.BytesIO(buffer.getvalue()),
        media_type='application/pdf',
        filename=f"bon_reception_{request.request_number}.pdf"
    )


