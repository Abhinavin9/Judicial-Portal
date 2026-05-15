<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>FIR Report - {{ $fir->fir_number }}</title>
    <style>
        body { font-family: 'DejaVu Sans', sans-serif; font-size: 12px; color: #333; line-height: 1.6; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { margin: 0; text-transform: uppercase; letter-spacing: 2px; }
        .section { margin-bottom: 25px; }
        .section-title { font-weight: bold; background: #f0f0f0; padding: 5px 10px; margin-bottom: 15px; text-transform: uppercase; font-size: 14px; border-left: 4px solid #333; }
        .grid { display: table; width: 100%; border-collapse: collapse; }
        .grid-row { display: table-row; }
        .grid-cell { display: table-cell; padding: 8px; border-bottom: 1px solid #eee; }
        .label { font-weight: bold; width: 30%; color: #666; }
        .value { width: 70%; }
        .footer { text-align: center; font-size: 10px; color: #999; border-top: 1px solid #eee; padding-top: 20px; margin-top: 40px; }
    </style>
</head>
<body>
    <div class="header">
        <p style="margin: 0; font-weight: bold;">GOVERNMENT OF INDIA</p>
        <p style="margin: 0; font-size: 10px;">LAW ENFORCEMENT & JUDICIAL PORTAL</p>
        <h1>FIRST INFORMATION REPORT (FIR)</h1>
    </div>

    <div class="section">
        <div class="section-title">FIR Identification</div>
        <div class="grid">
            <div class="grid-row">
                <div class="grid-cell label">FIR Number:</div>
                <div class="grid-cell value">{{ $fir->fir_number }}</div>
            </div>
            <div class="grid-row">
                <div class="grid-cell label">Title / Offense:</div>
                <div class="grid-cell value">{{ $fir->title }}</div>
            </div>
            <div class="grid-row">
                <div class="grid-cell label">Incident Date:</div>
                <div class="grid-cell value">{{ $fir->incident_date->format('d M Y, h:i A') }}</div>
            </div>
            <div class="grid-row">
                <div class="grid-cell label">Location:</div>
                <div class="grid-cell value">{{ $fir->location }}</div>
            </div>
            <div class="grid-row">
                <div class="grid-cell label">Status:</div>
                <div class="grid-cell value">{{ strtoupper(str_replace('_', ' ', $fir->status)) }}</div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">Reporting Officer & Case Context</div>
        <div class="grid">
            <div class="grid-row">
                <div class="grid-cell label">Filed By:</div>
                <div class="grid-cell value">{{ $fir->filedBy->name }} (Officer ID: {{ $fir->filed_by_id }})</div>
            </div>
            <div class="grid-row">
                <div class="grid-cell label">Police Station:</div>
                <div class="grid-cell value">{{ $fir->police_station_id ?? 'N/A' }}</div>
            </div>
            <div class="grid-row">
                <div class="grid-cell label">Linked Case:</div>
                <div class="grid-cell value">{{ $fir->linkedCase->case_number ?? 'NOT LINKED TO COURT CASE' }}</div>
            </div>
            <div class="grid-row">
                <div class="grid-cell label">Registration Date:</div>
                <div class="grid-cell value">{{ $fir->created_at->format('d M Y') }}</div>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">FIR Description & Narrative</div>
        <div style="padding: 10px; background: #fafafa; border: 1px solid #eee; white-space: pre-wrap;">
            {{ $fir->description }}
        </div>
    </div>

    @if($fir->evidences->count() > 0)
    <div class="section">
        <div class="section-title">Linked Evidence & Attachments</div>
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background: #f0f0f0;">
                    <th style="padding: 8px; border: 1px solid #eee; text-align: left;">Evidence Title</th>
                    <th style="padding: 8px; border: 1px solid #eee; text-align: left;">Type</th>
                    <th style="padding: 8px; border: 1px solid #eee; text-align: left;">Date Added</th>
                </tr>
            </thead>
            <tbody>
                @foreach($fir->evidences as $evidence)
                <tr>
                    <td style="padding: 8px; border: 1px solid #eee;">{{ $evidence->title }}</td>
                    <td style="padding: 8px; border: 1px solid #eee;">{{ strtoupper($evidence->file_type) }}</td>
                    <td style="padding: 8px; border: 1px solid #eee;">{{ $evidence->created_at->format('d M Y') }}</td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>
    @endif

    <div class="footer">
        <p>This is a computer-generated document from the Judicial Portal System.</p>
        <p>Generated on {{ date('d M Y, h:i A') }}</p>
    </div>
</body>
</html>
