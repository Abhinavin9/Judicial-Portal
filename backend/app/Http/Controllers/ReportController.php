<?php

namespace App\Http\Controllers;

use App\Models\CaseModel;
use App\Models\Hearing;
use App\Models\Fir;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class ReportController extends Controller
{
    public function caseReport($id)
    {
        $user = auth()->user();
        $case = CaseModel::with(['client', 'judge', 'lawyer', 'hearings', 'documents', 'timeline.user'])
            ->findOrFail($id);

        // RBAC: Clients can only download their own cases
        if ($user->isClient() && $case->client_id !== $user->id) {
            abort(403, 'Unauthorized access to this case report.');
        }

        // Lawyers and Judges can only download their assigned cases
        if ($user->isLawyer() && $case->assigned_lawyer_id !== $user->id) {
            abort(403, 'Unauthorized access to this case report.');
        }
        if ($user->isJudge() && $case->assigned_judge_id !== $user->id) {
            abort(403, 'Unauthorized access to this case report.');
        }

        $pdf = Pdf::loadView('reports.case', compact('case'));
        
        return $pdf->download("case_report_{$case->case_number}.pdf");
    }

    public function hearingReport($id)
    {
        $user = auth()->user();
        $hearing = Hearing::with(['case', 'judge', 'participants'])
            ->findOrFail($id);

        // RBAC Check
        if (!$user->isSuperAdmin() && !$user->isCourtAdmin()) {
            $isParticipant = $hearing->participants()->where('user_id', $user->id)->exists();
            if (!$isParticipant) {
                abort(403, 'Unauthorized access to this hearing report.');
            }
        }

        $pdf = Pdf::loadView('reports.hearing', compact('hearing'));
        
        return $pdf->download("hearing_report_{$hearing->hearing_number}.pdf");
    }

    public function firReport($id)
    {
        $user = auth()->user();
        $fir = Fir::with(['filedBy', 'linkedCase', 'evidences'])->findOrFail($id);

        // RBAC Check
        if (!$user->isSuperAdmin() && !$user->isPolice() && !$user->isJudge()) {
            if (!$fir->linked_case_id) {
                abort(403, 'Unauthorized access to this FIR report.');
            }
            $case = $fir->linkedCase;
            if ($user->isClient() && $case->client_id !== $user->id) {
                abort(403, 'Unauthorized access to this FIR report.');
            }
            if ($user->isLawyer() && $case->assigned_lawyer_id !== $user->id) {
                abort(403, 'Unauthorized access to this FIR report.');
            }
        }

        $pdf = Pdf::loadView('reports.fir', compact('fir'));
        return $pdf->download("fir_report_{$fir->fir_number}.pdf");
    }

    public function casesList(Request $request)
    {
        $query = CaseModel::with(['client', 'judge', 'lawyer']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('start_date')) {
            $query->where('filing_date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->where('filing_date', '<=', $request->end_date);
        }

        $cases = $query->orderBy('filing_date', 'desc')->get();

        $pdf = Pdf::loadView('reports.cases-list', compact('cases'));
        
        return $pdf->download("cases_list_" . date('Y-m-d') . ".pdf");
    }

    public function hearingsList(Request $request)
    {
        $query = Hearing::with(['case', 'judge']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('start_date')) {
            $query->where('hearing_date', '>=', $request->start_date);
        }

        if ($request->has('end_date')) {
            $query->where('hearing_date', '<=', $request->end_date);
        }

        $hearings = $query->orderBy('hearing_date', 'desc')->get();

        $pdf = Pdf::loadView('reports.hearings-list', compact('hearings'));
        
        return $pdf->download("hearings_list_" . date('Y-m-d') . ".pdf");
    }
}
